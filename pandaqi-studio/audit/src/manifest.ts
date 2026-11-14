import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import type { Contract, Kind, ManifestEntry } from "./lib/types";

export const walk = (dir:string, out:string[] = []) : string[] =>
{
    if(!existsSync(dir)) { return out; }
    for(const item of readdirSync(dir, { withFileTypes: true }))
    {
        const p = join(dir, item.name);
        if(item.isDirectory()) { walk(p, out); }
        else if(item.name.endsWith(".md")) { out.push(p); }
    }
    return out;
}

export const frontmatter = (text:string) =>
{
    if(!text.startsWith("---")) { return ""; }
    const end = text.indexOf("\n---", 3);
    if(end < 0) { return ""; }
    return text.slice(0, end);
}

export const typeOf = (fm:string) : Kind|null =>
{
    const m = fm.match(/^\s*type:\s*["']?([a-zA-Z]+)["']?\s*$/m);
    if(!m) { return null; }
    const t = m[1].toLowerCase();
    if(t === "game" || t === "board" || t === "rules") { return t; }
    return t === "tool" ? "other" : null;
}

// content/<dir>/_index.md -> /<dir>/ ; content/<dir>/game.md -> /<dir>/game/
export const urlForMarkdown = (contentDir:string, mdPath:string) =>
{
    const rel = resolve(mdPath).slice(resolve(contentDir).length + 1).replace(/\\/g, "/");
    const parts = rel.split("/");
    const file = parts.pop() as string;
    const base = file.replace(/\.md$/, "");
    const dir = parts.join("/");
    if(base === "_index") { return { url: `/${dir}/`.replace(/\/+/g, "/"), legacyPath: false }; }
    return {
        url: `/${dir}/${base}/`.replace(/\/+/g, "/"),
        legacyPath: base.startsWith("_"),
    };
}

const all = (html:string, re:RegExp) =>
{
    const out:string[] = [];
    let m;
    while((m = re.exec(html)) !== null) { out.push(m[1]); }
    return out;
}

const uniq = <T,>(arr:T[]) => Array.from(new Set(arr));

const classify = (kind:Kind, bundleText:string) : Contract =>
{
    if(kind === "rules") { return "rulebook"; }
    if(kind === "board") { return "generator"; }
    if(kind === "game") { return bundleText.includes("downloadPDF") ? "generator" : "digital"; }
    return "none";
}

const isDraftProject = (studioDir:string, projectRoot:string) =>
{
    const index = join(studioDir, "content", projectRoot, "_index.md");
    if(!existsSync(index)) { return false; }
    return /^\s*draft:\s*true\s*$/m.test(frontmatter(readFileSync(index, "utf8")));
}

export interface ManifestOptions
{
    studioDir: string;
    siteDir: string;
    filter?: string;
}

export const buildManifest = (opts:ManifestOptions) : ManifestEntry[] =>
{
    const contentDir = join(opts.studioDir, "content");
    const entries: ManifestEntry[] = [];

    for(const mdPath of walk(contentDir))
    {
        const text = readFileSync(mdPath, "utf8");
        const kind = typeOf(frontmatter(text));
        if(!kind) { continue; }

        const { url, legacyPath } = urlForMarkdown(contentDir, mdPath);
        const htmlPath = join(opts.siteDir, url, "index.html");

        const projectRoot = url.split("/").filter(Boolean)[0] ?? "";

        if(opts.filter && !url.includes(`/${opts.filter}`) && !url.includes(opts.filter))
        {
            continue;
        }

        if(!existsSync(htmlPath))
        {
            entries.push({
                url, kind, contract: "none", scripts: [], links: [], examples: [], tables: [],
                bodyClass: "", hasRulebookContent: false, bundleText: "",
                isDraftProject: isDraftProject(opts.studioDir, projectRoot),
                legacyPath, missing: true,
                sourceMd: mdPath.slice(resolve(contentDir).length + 1).replace(/\\/g, "/"),
                htmlPath,
            });
            continue;
        }

        const html = readFileSync(htmlPath, "utf8");
        const scripts = uniq(all(html, /<script[^>]+src="([^"]+)"/g));
        const links = uniq(all(html, /<link[^>]+href="([^"]+)"/g));
        const examples = uniq(all(html, /data-rulebook-example="([^"]+)"/g));
        const tables = uniq(all(html, /data-rulebook-table="([^"]+)"/g));
        const bodyClass = (html.match(/<body[^>]*class="([^"]*)"/) ?? ["", ""])[1];
        const hasRulebookContent = /id="rulebook-content"/.test(html);

        const bundleParts:string[] = [];
        for(const src of scripts)
        {
            if(!/\/(games|lib)\//.test(src) && !src.endsWith("/rulebook-default.js")) { continue; }
            const file = join(opts.siteDir, src.replace(/^\//, ""));
            if(existsSync(file)) { bundleParts.push(readFileSync(file, "utf8")); }
        }
        const bundleText = bundleParts.join("\n");

        entries.push({
            url,
            kind,
            contract: classify(kind, bundleText),
            scripts,
            links,
            examples,
            tables,
            bodyClass,
            hasRulebookContent,
            bundleText,
            isDraftProject: isDraftProject(opts.studioDir, projectRoot),
            legacyPath,
            missing: false,
            sourceMd: mdPath.slice(resolve(contentDir).length + 1).replace(/\\/g, "/"),
            htmlPath,
        });
    }

    entries.sort((a, b) => a.url.localeCompare(b.url));
    return entries;
}

export const writeManifest = (path:string, entries:ManifestEntry[]) =>
{
    mkdirSync(dirname(path), { recursive: true });
    // bundleText is only needed in memory; keeping it out makes manifest.json readable
    const slim = entries.map(({ bundleText, ...rest }) => ({ ...rest, bundleBytes: bundleText.length }));
    writeFileSync(path, JSON.stringify(slim, null, 2), "utf8");
}

export const slugOf = (url:string) =>
{
    const slug = url.replace(/^\/|\/$/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
    return slug || basename(url) || "root";
}
