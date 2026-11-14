import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { frontmatter, typeOf, urlForMarkdown } from "./manifest";

// §2.4 of MIGRATION.md: source-level checks that cost seconds. A typo should not need a build and a
// minute-long browser run to surface. Errors exit non-zero, warnings and info only report.
//
//   bun run static                     everything
//   bun run static --filter <project>  one project
//
// Every finding names the check (SC-1..SC-7) so the report and this table stay the same thing.

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const contentDir = join(studioDir, "content");
const assetsDir = join(studioDir, "themes", "pandaqi", "assets");
const gamesDir = join(assetsDir, "games");

type Severity = "error" | "warn" | "info";

export interface StaticFinding
{
    check: string;
    severity: Severity;
    file: string;
    line: number;
    message: string;
}

const rel = (file:string) => relative(studioDir, file).split("\\").join("/");

const walk = (dir:string, exts:string[]) : string[] =>
{
    const out:string[] = [];
    if(!existsSync(dir)) { return out; }
    for(const item of readdirSync(dir, { withFileTypes: true }))
    {
        const p = join(dir, item.name);
        if(item.isDirectory()) { out.push(...walk(p, exts)); }
        else if(exts.some(ext => item.name.endsWith(ext))) { out.push(p); }
    }
    return out;
}

const lineOf = (text:string, index:number) => text.slice(0, index).split("\n").length;

const read = (file:string) => readFileSync(file, "utf8");

// ---------------------------------------------------------------------------------------------
// entries and their import graphs
// ---------------------------------------------------------------------------------------------

const entryFor = (url:string) : string|null =>
{
    const raw = `games${url}`.replace(/^\/+/, "").replace(/\/+$/, "");
    const candidates = [join(assetsDir, `${raw}.ts`), join(assetsDir, raw, "main.ts")];
    return candidates.find(f => existsSync(f)) ?? null;
}

const IMPORT_RE = /(?:from\s*|import\s*\(?\s*|require\s*\(\s*)["']([^"']+)["']/g;

// `lib/*` is the framework, not page code: it is not part of what a page is allowed to say.
const resolveImport = (from:string, spec:string) : string|null =>
{
    // page code addresses siblings relatively and the rest of the tree through the `games/` alias;
    // `lib/*` is the framework and is deliberately not part of a page's graph
    let base:string;
    if(spec.startsWith(".")) { base = resolve(dirname(from), spec); }
    else if(spec.startsWith("games/")) { base = join(assetsDir, spec.slice("games/".length)); }
    else { return null; }
    const tries = [base, `${base}.ts`, `${base}.js`, join(base, "index.ts"), join(base, "main.ts"), join(base, "index.js")];
    return tries.find(f => /\.(ts|js)$/.test(f) && existsSync(f)) ?? null;
}

const graphs = new Map<string, string[]>();

const graphOf = (entry:string) : string[] =>
{
    const cached = graphs.get(entry);
    if(cached) { return cached; }

    const files:string[] = [];
    const seen = new Set<string>();
    const queue = [entry];
    while(queue.length > 0)
    {
        const file = queue.shift() as string;
        if(seen.has(file)) { continue; }
        seen.add(file);
        files.push(file);
        const text = read(file);
        for(const match of text.matchAll(IMPORT_RE))
        {
            const target = resolveImport(file, match[1]);
            if(target && !seen.has(target)) { queue.push(target); }
        }
    }

    graphs.set(entry, files);
    return files;
}

// ---------------------------------------------------------------------------------------------
// pages
// ---------------------------------------------------------------------------------------------

interface Page
{
    url: string;
    kind: "game" | "board" | "rules";
    projectRoot: string;
    entry: string | null;
    exampleIds: string[];
    tableIds: string[];
}

// markdown reaches these ids two ways: the shortcode (id="turn") and raw HTML (data-rulebook-example="turn")
const idsOf = (text:string, markers:string[]) =>
{
    const out:string[] = [];
    for(const marker of markers)
    {
        for(const match of text.matchAll(new RegExp(`${marker}[^\\n]*?\\bid\\s*=\\s*"([^"]+)"`, "g"))) { out.push(match[1]); }
        for(const match of text.matchAll(new RegExp(`${marker}="([^"]+)"`, "g"))) { out.push(match[1]); }
    }
    return Array.from(new Set(out));
}

const projectRootOf = (url:string) => url.split("/").filter(Boolean)[0] ?? "";

const collectPages = (filter?:string) : Page[] =>
{
    const pages:Page[] = [];
    for(const mdPath of walk(contentDir, [".md"]))
    {
        const text = read(mdPath);
        const kind = typeOf(frontmatter(text));
        if(kind !== "game" && kind !== "board" && kind !== "rules") { continue; }

        const { url } = urlForMarkdown(contentDir, mdPath);
        if(filter && !url.includes(filter)) { continue; }

        pages.push({
            url, kind,
            projectRoot: projectRootOf(url),
            entry: entryFor(url),
            exampleIds: idsOf(text, ["rules/rules-example", "rules-example", "rulebook-example"]),
            tableIds: idsOf(text, ["rules/rules-table", "rules-table", "rulebook-table"]),
        });
    }
    return pages;
}

// ---------------------------------------------------------------------------------------------
// checks
// ---------------------------------------------------------------------------------------------

const LEGACY_PATTERNS: { re: RegExp, name: string, what: string }[] = [
    { re: /\bnew\s+ProgressBar\s*\(/, name: "ProgressBar", what: "new ProgressBar(" },
    { re: /\bnew\s+PdfBuilder\s*\(/, name: "PdfBuilder", what: "new PdfBuilder(" },
    { re: /\bnew\s+GridMapper\s*\(/, name: "GridMapper", what: "new GridMapper(" },
    { re: /\bnew\s+Visualizer\s*\(/, name: "Visualizer", what: "new Visualizer(" },
    { re: /\bPageFormat\b/, name: "PageFormat", what: "PageFormat" },
];

// SC-2 is about the globals V1 left behind, not about the class names: a module that imports or
// declares the name is fine and must not be flagged
const providesName = (text:string, name:string) =>
{
    return new RegExp(`import[^;]*\\b${name}\\b[^;]*from`).test(text)
        || new RegExp(`\\b(?:class|const|let|var|function)\\s+${name}\\b`).test(text);
}

const COMPUTED_KEY_RE = /\[\s*[^\]]*?\+\s*["'`]-|`[^`\n]*\$\{[^}]+\}-\$\{|\$\{[^}]+\}\s*\+\s*["'`]/;

const stringLiteralsOf = (text:string) =>
{
    const out = new Set<string>();
    for(const match of text.matchAll(/["'`]([A-Za-z0-9_\-]+)["'`]/g)) { out.add(match[1]); }
    for(const match of text.matchAll(/(?:^|[\s{,])["']?([A-Za-z_$][\w$\-]*)["']?\s*:/g)) { out.add(match[1]); }
    return out;
}

const blockStartingAt = (text:string, index:number) =>
{
    let depth = 0;
    for(let i = index; i < text.length; i++)
    {
        if(text[i] === "{") { depth++; }
        else if(text[i] === "}") { depth--; if(depth === 0) { return text.slice(index, i + 1); } }
    }
    return text.slice(index);
}

const resourcePathsOf = (text:string) =>
{
    const at = text.search(/_resources\s*:/);
    if(at < 0) { return null; }
    const block = blockStartingAt(text, text.indexOf("{", at));
    const base = (block.match(/\bbase\s*:\s*["']([^"']+)["']/) ?? ["", ""])[1] || null;
    const paths = Array.from(block.matchAll(/\bpath\s*:\s*["']([^"']+)["']/g)).map(m => m[1]);
    return { base, paths };
}

const canResolveResource = (path:string, base:string|null, projectRoot:string) =>
{
    const candidates:string[] = [];
    if(path.startsWith("/"))
    {
        candidates.push(join(contentDir, path), join(studioDir, "static", path), join(studioDir, "themes", "pandaqi", "static", path));
        if(base) { candidates.push(join(contentDir, base.replace(/^\/+/, ""), path)); }
    }
    else
    {
        candidates.push(join(contentDir, projectRoot, path));
        if(base)
        {
            const b = base.replace(/^\/+/, "");
            candidates.push(join(contentDir, b, path), join(studioDir, "static", b, path), join(studioDir, "themes", "pandaqi", "static", b, path));
        }
    }
    return candidates.some(f => existsSync(f)) ? null : candidates[0];
}

export interface StaticOptions
{
    filter?: string;
    quiet?: boolean;
}

export const runStaticChecks = (opts:StaticOptions = {}) =>
{
    const findings:StaticFinding[] = [];
    const add = (check:string, severity:Severity, file:string, line:number, message:string) =>
    {
        findings.push({ check, severity, file: rel(file), line, message });
    }

    const pages = collectPages(opts.filter);

    // SC-1: `_settings` chain without `.value`. With a filter, only the code those pages reach.
    const scoped = opts.filter ? new Set(pages.flatMap(p => p.entry ? graphOf(p.entry) : [])) : null;
    const sourceFiles = walk(gamesDir, [".ts", ".js"]).filter(f => !scoped || scoped.has(f));
    for(const file of sourceFiles)
    {
        const text = read(file);
        // a group is addressed per key as `_settings.sets[set].value`, so bracket segments are part of
        // the chain; stopping at the dot flagged every one of those as a missing read
        for(const match of text.matchAll(/_settings(?:\.[A-Za-z_$][\w$]*|\[[^\]]*\])+/g))
        {
            const segments = (match[0] as string).split(".").slice(1);
            if(segments.includes("value")) { continue; }
            if(segments[0] === "defaults" || segments[0] === "meta") { continue; }
            const before = text.slice(Math.max(0, (match.index as number) - 60), match.index);
            // iterating the group's children (or copying it) is a legitimate read; only reading the
            // object as if it were the value is the defect
            if(/Object\.(keys|entries|values)\(\s*[\w$.]*$/.test(before)) { continue; }
            if(/Object\.assign\(\s*(?:\{\s*\}\s*,\s*|[\w$.]+\s*,\s*)?[\w$.]*$/.test(before)) { continue; }
            add("SC-1", "warn", file, lineOf(text, match.index as number),
                `\`${match[0]}\` is read without \`.value\`; a setting object is not the value`);
        }
    }

    const allEntries = new Set<string>();
    const importedFiles = new Set<string>();

    // standalone content pages name their script in front matter instead of going through a layout
    for(const file of walk(contentDir, [".md", ".html"]))
    {
        for(const match of read(file).matchAll(/customJS\s*:\s*["']([^"']+)["']/g))
        {
            const target = join(assetsDir, match[1].replace(/^\/+/, ""));
            if(existsSync(target)) { importedFiles.add(target); }
        }
    }

    for(const page of pages)
    {
        const entry = page.entry;
        if(!entry)
        {
            // a game/board/rules page with no entry is a page-level bug the build already reports
            continue;
        }

        allEntries.add(entry);
        const files = graphOf(entry);
        for(const file of files) { importedFiles.add(file); }
        const entryText = read(entry);
        const graphText = files.map(f => read(f)).join("\n");

        // SC-2: legacy framework globals in page code
        for(const file of files)
        {
            const text = read(file);
            for(const pattern of LEGACY_PATTERNS)
            {
                if(providesName(text, pattern.name)) { continue; }
                for(const match of text.matchAll(new RegExp(pattern.re.source, "g")))
                {
                    add("SC-2", "error", file, lineOf(text, match.index as number),
                        `\`${pattern.what}\` is a V1 global; import it from \`lib/pq-games\` instead`);
                }
            }
        }

        // SC-3: every game/board entry mounts the framework
        if(page.kind === "game" || page.kind === "board")
        {
            if(!/\bloadGame\s*\(|\bloadSettings\s*\(/.test(entryText))
            {
                add("SC-3", "error", entry, 1, `${page.url} never calls loadGame( or loadSettings(; the page renders nothing`);
            }
        }

        // SC-4: every rules entry with examples or tables loads the rulebook
        if(page.kind === "rules")
        {
            const needsRulebook = page.exampleIds.length > 0 || page.tableIds.length > 0;
            if(needsRulebook && !/\bloadRulebook\s*\(/.test(entryText))
            {
                add("SC-4", "error", entry, 1,
                    `${page.url} declares ${page.exampleIds.length} example(s) and ${page.tableIds.length} table(s) but never calls loadRulebook(`);
            }
        }

        // SC-5: every declared id exists as a key in the entry's graph
        const ids = Array.from(new Set([...page.exampleIds, ...page.tableIds]));
        if(ids.length > 0)
        {
            const computed = COMPUTED_KEY_RE.test(graphText);
            const literals = stringLiteralsOf(graphText);
            for(const id of ids)
            {
                if(literals.has(id)) { continue; }
                if(computed) { continue; }
                add("SC-5", "error", entry, 1,
                    `markdown declares id "${id}" but no module in this entry's graph uses that key`);
            }
        }

        // SC-6: every declared resource path exists on disk
        for(const file of files)
        {
            const text = read(file);
            const resources = resourcePathsOf(text);
            if(!resources) { continue; }
            for(const path of resources.paths)
            {
                const missing = canResolveResource(path, resources.base, page.projectRoot);
                if(!missing) { continue; }
                add("SC-6", "error", file, lineOf(text, text.indexOf(path)),
                    `resource path "${path}" does not exist (looked in ${rel(missing)})`);
            }
        }
    }

    // SC-7: info only, no page attribution
    const stray = walk(assetsDir, [".old", ".v1.ts"]).concat(
        walk(gamesDir, [".ts"]).filter(f => f.endsWith("_index.old")));
    for(const file of Array.from(new Set(stray)))
    {
        add("SC-7", "info", file, 1, "stray file (*.old, *.v1.ts, _index.old); delete or fold into the real one");
    }

    if(!opts.filter)
    {
        for(const file of walk(gamesDir, [".ts"]))
        {
            if(importedFiles.has(file) || allEntries.has(file)) { continue; }
            if(file.endsWith(".d.ts")) { continue; }
            if(file.startsWith(join(gamesDir, "tools"))) { continue; }   // §9: tools are out of scope
            add("SC-7", "info", file, 1, "no entry imports this module");
        }
    }

    const projectsWithDrawing = new Map<string, boolean>();
    for(const page of pages)
    {
        if(!page.entry) { continue; }
        if(projectsWithDrawing.has(page.projectRoot)) { continue; }
        const graphText = graphOf(page.entry).map(f => read(f)).join("\n");
        if(!/_drawing\s*:/.test(graphText)) { continue; }
        projectsWithDrawing.set(page.projectRoot, /\bCVal\b/.test(graphText));
    }
    for(const [project, hasCVal] of projectsWithDrawing)
    {
        if(hasCVal) { continue; }
        add("SC-7", "info", join(contentDir, project), 1,
            `${project}: \`_drawing\` uses raw numbers, not \`CVal\` (non-canonical, see §3.5/§6.6)`);
    }

    const counts = {
        error: findings.filter(f => f.severity === "error").length,
        warn: findings.filter(f => f.severity === "warn").length,
        info: findings.filter(f => f.severity === "info").length,
    };

    if(!opts.quiet)
    {
        const order:Severity[] = ["error", "warn", "info"];
        for(const severity of order)
        {
            const list = findings.filter(f => f.severity === severity);
            if(list.length === 0) { continue; }
            console.log(`\n${severity.toUpperCase()} (${list.length})`);
            for(const f of list) { console.log(`  ${f.check} ${f.file}:${f.line} — ${f.message}`); }
        }
        console.log(`\n${pages.length} page(s): ${counts.error} error(s), ${counts.warn} warning(s), ${counts.info} info`);
    }

    return { findings, counts, pages: pages.length };
}

if(import.meta.main)
{
    const filterArg = process.argv.indexOf("--filter");
    const filter = filterArg >= 0 ? process.argv[filterArg + 1] : undefined;
    const result = runStaticChecks({ filter });
    process.exit(result.counts.error > 0 ? 1 : 0);
}
