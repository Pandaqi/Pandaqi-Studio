import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { auditDir, auditReportPath, contentDir, rendersDir, siteDir } from "../config";
import { run } from "../lib/proc";
import type { ProjectInfo } from "./inspect";

// The heavy lifting already exists in audit/src: a filtered Hugo build (a segment containing only
// this project) plus the browser audit for rulebooks, generators and digital games. The pipeline
// drives it rather than duplicating it, and adds the one flag the marketing step needs: --render
// keeps spread-out PDF page previews instead of only measuring a canvas.

export interface AuditEntry
{
    url: string;
    contract: string;
    status: string;
    failures: string[];
    // files this run wrote next to the page (the harness' own artifacts): a rulebook's `page.png` is
    // the screenshot `--capture-rulebook` puts in the gallery
    artifacts: string[];
}

export interface AuditStageResult
{
    status: "pass" | "warn" | "fail" | "skipped";
    detail: string;
    entries: AuditEntry[];
    rendersDir: string;
    reportPath: string | null;
    notes: string[];
}

const EXIT_REASONS:Record<number,string> = {
    1: "one or more audited pages failed",
    2: "the filtered site build failed",
    3: "the audit harness hit an internal error",
    4: "another audit is already running (lock file)",
    5: "the static checks found errors; run `bun run static --filter <project>` for the detail",
};

// A game nested in a collection may borrow files from the collection's page bundle: the naivigation
// games load `/naivigation/assets/fonts/K2D-*.woff2`, which belong to `content/naivigation/_index.md`.
// A segment publishes only the pages it includes, so those would 404 and generation would stall. Every
// ancestor page that has an `assets/` folder is therefore rendered alongside the project.
export const ancestorAssetBundles = (projectPath:string, root:string = contentDir) : string[] =>
{
    const parts = projectPath.split("/").filter(Boolean);
    const out:string[] = [];
    for(let depth = 1; depth < parts.length; depth++)
    {
        const path = parts.slice(0, depth).join("/");
        if(existsSync(join(root, path, "_index.md")) && existsSync(join(root, path, "assets"))) { out.push(path); }
    }
    return out;
};

export const runAuditStage = async (info:ProjectInfo, opts:{ pdfFull:boolean, captureRulebook:boolean }) : Promise<AuditStageResult> =>
{
    // The trailing slash matters: the harness matches its filter as a substring, so `waterfall`
    // would also queue `/waterfall-raging-rapids/` — a different game that this segment build never
    // renders. `waterfall/` matches this project and its own subpages, nothing else.
    const filter = `${info.projectPath}/`;
    const includes = ancestorAssetBundles(info.projectPath);
    const args = [
        "src/main.ts",
        "--filter", filter,
        "--segment", info.projectPath,
        "--render",
        // The full document, not a preview: the four previews are picked spread across every page the
        // generator drew, so a deck offers four genuinely different pages instead of a cover and its
        // neighbours. `--pdf-max-pages 0` is no cap — the harness' own default is two pages.
        "--pdf-max-pages", "0",
        "--renders-per-pdf", "4",
        "--renders-total", "12",
        // Drawing every card of a full deck takes longer than the sweep's default 90 s ceiling.
        "--gen-timeout", "180000",
        "--runs", "1",
    ];
    // One viewport screenshot per audited page, which costs a full-page PNG capture. Only the
    // rulebook's is used, so it is only asked for when the gallery is going to show it.
    if(opts.captureRulebook) { args.push("--screenshots"); }
    for(const ancestor of includes) { args.push("--segment-include", ancestor); }
    // The games inside this project are releases of their own. Building them here made a collection
    // release audit every one of them (16 pages instead of 2); one `--exclude` takes them out of both
    // the segment build and the audit queue, so they are neither built nor reported as NOT_BUILT.
    for(const child of info.childProjects) { args.push("--exclude", child); }
    if(opts.pdfFull) { args.push("--pdf-full"); }

    // The audit harness caches its build on a hash of content/assets/themes only, not on the segment,
    // and it never cleans its destination. A cached build for project A would therefore be reused for
    // project B, and stale pages from earlier builds would still be found and audited. The marker
    // below records which project the output directory was built for; anything else (a different
    // project, or a build made by the audit CLI directly) means a clean build. That is what makes
    // "only this project" true rather than likely.
    // The marker records the segment's exact shape, not only the project: adding an ancestor include
    // changes what the build must contain, and the harness only hashes content/assets/themes.
    const segmentMarker = join(siteDir, ".pipeline-segment");
    const markerValue = JSON.stringify({ project: info.projectPath, includes, excludes: info.childProjects });
    const builtFor = existsSync(segmentMarker) ? readFileSync(segmentMarker, "utf8").trim() : null;
    if(builtFor !== markerValue)
    {
        rmSync(siteDir, { recursive: true, force: true });
    }

    // Yesterday's report and yesterday's page previews would otherwise be read back as if this run
    // had produced them — including the case where the harness exits before auditing anything.
    rmSync(auditReportPath, { force: true });
    const renderRoot = join(rendersDir, info.projectPath);
    rmSync(renderRoot, { recursive: true, force: true });

    // --segment rewrites audit/segment.toml, a tracked file. Put the author's version back afterwards
    // so a release never leaves an unrelated diff behind.
    const segmentFile = join(auditDir, "segment.toml");
    const segmentBefore = existsSync(segmentFile) ? readFileSync(segmentFile, "utf8") : null;

    console.log(`        running: bun ${args.join(" ")} (this builds the site through a segment that contains only this project)`);
    const startedAt = Date.now();
    let result;
    try
    {
        result = await run("bun", args, { cwd: auditDir, stream: true, label: "  audit|" });
    }
    finally
    {
        if(segmentBefore !== null) { writeFileSync(segmentFile, segmentBefore, "utf8"); }
    }

    if(existsSync(join(siteDir, info.projectPath, "index.html")))
    {
        writeFileSync(segmentMarker, markerValue, "utf8");
    }

    const notes:string[] = [];
    const entries:AuditEntry[] = [];
    if(existsSync(auditReportPath))
    {
        try
        {
            const report = JSON.parse(readFileSync(auditReportPath, "utf8"));
            entries.push(...(report.results ?? [])
                .filter((entry:any) => owned(entry.url, info))
                .map((entry:any) => ({
                    url: entry.url,
                    contract: entry.contract,
                    status: entry.status,
                    failures: (entry.failures ?? []).map((failure:any) => `${failure.code}: ${failure.message}`),
                    // Only files this run wrote. The artifacts folder is shared between runs, so
                    // yesterday's page.png must not become today's rulebook screenshot.
                    artifacts: (entry.artifacts ?? []).filter((file:string) =>
                        existsSync(file) && statSync(file).mtimeMs >= startedAt - 2000),
                })));
        }
        catch(error:any)
        {
            notes.push(`could not read ${auditReportPath}: ${error?.message ?? error}`);
        }
    }

    if(entries.length === 0)
    {
        return {
            status: "fail",
            detail: `no audited page for ${info.projectPath}` + (EXIT_REASONS[result.code] ? ` — ${EXIT_REASONS[result.code]}` : ` (exit ${result.code})`),
            entries, rendersDir: renderRoot, reportPath: existsSync(auditReportPath) ? auditReportPath : null, notes,
        };
    }

    const suppressed = suppressKnownFalsePositives(entries, siteDir);
    if(suppressed > 0)
    {
        notes.push(`ignored ${suppressed} RB_SECTION_MISSING false positive(s): the rulebook layout puts a screen-reader-only "<title> — Rulebook" h1 inside #rulebook-content, and the harness counts it as a rulebook section`);
    }

    const failed = entries.filter(entry => entry.failures.length > 0);
    if(result.code !== 0 && failed.length === 0)
    {
        // The harness queued more than this project: a collection's segment also renders its games, and
        // a filtered build leaves NOT_BUILT pages in the queue. Those failures are not this release's,
        // but the note has to say so instead of blaming everything on the one suppressed false positive.
        const other = [
            suppressed > 0 ? `${suppressed} suppressed RB_SECTION_MISSING false positive(s)` : null,
            "pages outside this project that the filtered build still queues",
        ].filter(Boolean).join(" and ");
        notes.push(`the audit harness exited with ${result.code} (${EXIT_REASONS[result.code] ?? "no reason given"}), ` +
            `but every page of this project passes; the rest of its queue is ${other}. See ` +
            `audit-artifacts/report.json for the individual pages.`);
    }

    if(!entries.some(entry => entry.contract === "rulebook"))
    {
        notes.push(`NO_RULEBOOK_AUDIT: the audit found no rulebook page for this project, so rulebook interaction was not tested (${info.rulebookFiles.length > 0 ? "markdown exists but no page was classified as a rulebook" : "no rules markdown exists"})`);
    }
    if(!entries.some(entry => entry.contract === "generator"))
    {
        notes.push(`NO_GENERATOR_AUDIT: the audit found no generator page for this project, so material generation was not tested${info.generatorEvidence ? " even though the source calls loadGame(" : ""}`);
    }

    return {
        status: failed.length > 0 ? "fail" : "pass",
        detail: `${entries.length} page(s) audited — ` + entries.map(entry => `${entry.url} ${entry.status}`).join(", "),
        entries,
        rendersDir: renderRoot,
        reportPath: existsSync(auditReportPath) ? auditReportPath : null,
        notes,
    };
};

// A page belongs to this project when it sits under its path and is not a nested project's page:
// releasing `naivigation` must not be blocked by `naivigation/swing-by`.
const owned = (url:string, info:ProjectInfo) =>
{
    if(url !== `/${info.projectPath}/` && !url.startsWith(`/${info.projectPath}/`)) { return false; }
    return !info.childProjects.some(child => url.startsWith(`/${child}/`));
};

export const builtPageExists = (info:ProjectInfo) =>
    existsSync(join(siteDir, info.projectPath, "index.html"));

// The theme's visually-hidden page title ("X — Rulebook"), which is inside the article but is not
// one of the rulebook's own sections.
const hiddenPageTitle = (htmlPath:string) : string | null =>
{
    if(!existsSync(htmlPath)) { return null; }
    const html = readFileSync(htmlPath, "utf8");
    const match = html.match(/<h1[^>]*style="[^"]*clip:\s*rect[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
    if(!match) { return null; }
    return match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
};

// Known false positive: the rulebook layout renders the page title as a screen-reader-only h1
// *inside* #rulebook-content. The harness treats every h1..h6 in that article as a rulebook section,
// so it reports that one title as a missing section on every rulebook page. The h1 is layout chrome,
// not markdown, and it cannot stop a release. Suppressed only for that exact hidden title, and the
// suppression is reported, never silent.
//
// Returns how many failures were dropped.
export const suppressKnownFalsePositives = (entries:AuditEntry[], root:string) : number =>
{
    let suppressed = 0;
    for(const entry of entries)
    {
        const htmlPath = join(root, entry.url.replace(/^\//, "").replace(/\/$/, ""), "index.html");
        const hidden = hiddenPageTitle(htmlPath);
        if(!hidden || !/—\s*Rulebook/i.test(hidden)) { continue; }

        const needle = `"${hidden.toLowerCase()}"`;
        const before = entry.failures.length;
        entry.failures = entry.failures.filter(failure =>
        {
            const known = failure.startsWith("RB_SECTION_MISSING") && failure.toLowerCase().includes(needle);
            if(known) { suppressed++; }
            return !known;
        });
        if(entry.failures.length !== before && entry.failures.length === 0 && entry.status === "fail")
        {
            entry.status = "pass";
        }
    }
    return suppressed;
};
