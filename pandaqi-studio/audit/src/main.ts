import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildSite, lastLines, writeSegment } from "./build";
import { buildManifest, slugOf, writeManifest } from "./manifest";
import { startServer } from "./serve";
import { Session } from "./lib/browser";
import { runRulebook } from "./pages/rulebook";
import { runGenerator } from "./pages/generator";
import { runDigital } from "./pages/digital";
import { copyBaseline, failureCounts, writeReports } from "./lib/report";
import { acquireLock, breathe, cleanupStrayAudits, freeMemoryMb, waitForMemory } from "./lib/govern";
import { runStaticChecks } from "./static";
import type { ManifestEntry, PageResult, ReportData } from "./lib/types";

const argv = process.argv.slice(2);
const hasFlag = (name:string) => argv.includes(`--${name}`);
const argValue = (name:string, fallback:string|undefined = undefined) =>
{
    const index = argv.indexOf(`--${name}`);
    if(index < 0) { return fallback; }
    const next = argv[index + 1];
    return next && !next.startsWith("--") ? next : fallback;
}
const argNumber = (name:string, fallback:number) =>
{
    const raw = argValue(name);
    const num = raw === undefined ? NaN : Number(raw);
    return Number.isFinite(num) ? num : fallback;
}

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const outDir = join(studioDir, "audit-artifacts");
const siteDir = join(outDir, "site");
const artifactsRoot = join(outDir, "artifacts");
const baselinesRoot = join(auditDir, "baselines");
const progressPath = join(outDir, "progress.json");
const auditEntry = join(auditDir, "src", "main.ts");
const chromeMarker = "pandaqi-audit";

const seed = argValue("seed", "audit-1") as string;
const timeoutMs = argNumber("timeout", 30000);
// A material generation runs the whole picker → draw → PDF pipeline; some games legitimately take a minute
// on a full deck, so this is a ceiling for "stuck", not a target. The harness caps the PDF itself
// (--pdf-max-pages) and drops its compression, which is where most of the time went.
const genTimeoutMs = argNumber("gen-timeout", 90000);
const exampleTimeoutMs = 10000;
// the sweep tests the pipeline, not the printing: two pages, uncompressed. `--pdf-full` restores production.
const pdfFull = hasFlag("pdf-full");
const auditPdf = pdfFull ? undefined : {
    maxPages: Math.max(0, argNumber("pdf-max-pages", 2)),
    compression: argValue("pdf-compression", "NONE"),
};
// one page at a time by default; two is the hard ceiling, because each worker is a whole browser page
// with full-page canvases in it
const workers = Math.min(2, Math.max(1, argNumber("workers", 1)));
const runs = Math.max(1, argNumber("runs", 1));
const kindFilter = argValue("kind");
const filter = argValue("filter");
const segment = argValue("segment");
const onlyFailing = hasFlag("only-failing");
const skipBuild = hasFlag("skip-build");
const baseUrlOverride = argValue("base-url");
const updateBaselines = hasFlag("update-baselines");
// a full sweep is a long job on a machine that is also being used: report and take a short break every few
// minutes, and let an interrupted run continue instead of starting the first page again
const resume = hasFlag("resume");
const reportEveryMs = Math.max(1, argNumber("report-every", 3)) * 60000;
const pauseMs = Math.max(0, argNumber("pause", 10)) * 1000;
const allowlist = loadAllowlist();

function loadAllowlist() : string[]
{
    const file = join(auditDir, "allowlist.json");
    if(!existsSync(file)) { return []; }
    try
    {
        const json = JSON.parse(readFileSync(file, "utf8"));
        return Array.isArray(json.http) ? json.http.length > 0 ? json.http : (json.httpAllowlist ?? []) : [];
    }
    catch(e) { return []; }
}

const matchesKind = (entry:ManifestEntry) =>
{
    if(!kindFilter) { return true; }
    if(kindFilter === entry.kind) { return true; }
    if(kindFilter === entry.contract) { return true; }
    if(kindFilter === "generator" && entry.contract === "generator") { return true; }
    return false;
}

const readProgress = () : PageResult[] =>
{
    if(!existsSync(progressPath)) { return []; }
    try
    {
        const data = JSON.parse(readFileSync(progressPath, "utf8"));
        if(data.version !== 1 || data.seed !== seed || data.runs !== runs) { return []; }
        return Array.isArray(data.results) ? data.results : [];
    }
    catch(e) { return []; }
}

const main = async () : Promise<number> =>
{
    mkdirSync(outDir, { recursive: true });
    mkdirSync(artifactsRoot, { recursive: true });

    // A previous audit that was killed leaves its Chrome behind, and that leftover is what makes the next
    // run crawl and fail with the memory guard. Stop it (and only it: this harness's entry point and this
    // harness's Chrome profile), then start Chrome from a clean profile.
    cleanupStrayAudits({ auditEntry, marker: chromeMarker });

    const startedAt = Date.now();

    // one build/audit at a time: two of these together is what actually takes a computer down
    try { acquireLock(outDir, `audit ${argv.join(" ")}`.trim()); }
    catch(e:any) { console.error(e.message); return 4; }

    // §2.4: source-level checks cost seconds and catch what a browser run can only describe; an
    // error here means the page cannot work, so do not spend a build and a minute per page on it
    if(!hasFlag("skip-static"))
    {
        const statics = runStaticChecks({ filter });
        if(statics.counts.error > 0)
        {
            console.error(`\nSTATIC_ERRORS (${statics.counts.error}) — fix these first, or pass --skip-static`);
            return 5;
        }
    }

    if(segment) { writeSegment(studioDir, segment); }

    // build
    let build = { exitCode: 0, durationMs: 0, cached: false, log: join(outDir, "build.log") };
    if(!baseUrlOverride)
    {
        const result = await buildSite({
            dest: siteDir,
            log: join(outDir, "build.log"),
            project: segment,
            skip: skipBuild,
            studioDir,
        });
        build = { exitCode: result.exitCode, durationMs: result.durationMs, cached: result.cached, log: result.log };
        if(result.exitCode !== 0)
        {
            console.error("BUILD_FAILED");
            console.error(lastLines(result.stdout, 40));
            return 2;
        }
        console.log(`build: exit 0 in ${(result.durationMs / 1000).toFixed(1)} s${result.cached ? " (reused)" : ""}`);
    }

    const entries = buildManifest({ studioDir, siteDir, filter });
    writeManifest(join(outDir, "manifest.json"), entries);

    let queue = entries.filter(matchesKind);

    // --resume: an interrupted sweep continues where it stopped (same seed and profile count only)
    const resumed = resume ? readProgress() : [];
    if(resumed.length > 0)
    {
        const done = new Set(resumed.map(r => r.url));
        const before = queue.length;
        queue = queue.filter(entry => !done.has(entry.url));
        console.log(`resume: ${before - queue.length} page(s) already recorded, ${queue.length} left`);
    }
    if(onlyFailing)
    {
        const previous = join(outDir, "report.json");
        if(existsSync(previous))
        {
            const data = JSON.parse(readFileSync(previous, "utf8"));
            const failing = new Set<string>((data.results ?? [])
                .filter((r:PageResult) => r.status === "fail")
                .map((r:PageResult) => r.url));
            queue = queue.filter(entry => failing.has(entry.url));
        }
    }

    const missing = queue.filter(entry => entry.missing);
    for(const entry of missing)
    {
        console.error(`NOT_BUILT ${entry.url} (${entry.sourceMd})`);
    }
    queue = queue.filter(entry => !entry.missing);

    const server = baseUrlOverride ? null : startServer(siteDir, argNumber("port", 8788));
    const baseUrl = baseUrlOverride ?? (server as any).url;
    console.log(`serving ${siteDir} at ${baseUrl} — ${queue.length} page(s), ${workers} worker(s), runs ${runs}`);

    const session = await Session.launch({ headed: hasFlag("headed"), marker: chromeMarker });
    const results:PageResult[] = [...resumed];
    const totalPages = queue.length + resumed.length;

    const saveProgress = () =>
    {
        try
        {
            writeFileSync(progressPath, JSON.stringify({ version: 1, seed, runs, startedAt, results }), "utf8");
        }
        catch(e) { /* progress is a convenience; the report at the end is the real output */ }
    }

    // A long sweep reports itself and then steps aside for a few seconds, so the machine (and the author)
    // get a predictable breather instead of one uninterrupted hour of Chrome + esbuild.
    let lastReportAt = Date.now();
    let breaking = false;
    const maybeBreak = async () =>
    {
        if(breaking || (Date.now() - lastReportAt) < reportEveryMs) { return; }
        breaking = true;
        saveProgress();
        const pass = results.filter(r => r.status === "pass").length;
        const fail = results.filter(r => r.status === "fail").length;
        const skip = results.filter(r => r.status === "skip").length;
        const minutes = ((Date.now() - startedAt) / 60000).toFixed(1);
        console.log(`[progress] ${results.length}/${totalPages} pages · ${pass} pass · ${fail} fail · ${skip} skip · ${minutes} min · pausing ${(pauseMs / 1000).toFixed(0)}s`);
        await breathe(pauseMs);
        lastReportAt = Date.now();
        breaking = false;
    };

    try
    {
        let cursor = 0;
        const worker = async () =>
        {
            while(cursor < queue.length)
            {
                const index = cursor++;
                const entry = queue[index];
                const started = Date.now();

                // machine guard: never open a page while memory is low, and give each finished page a
                // moment to be collected before the next one starts
                if(!(await waitForMemory()))
                {
                    results.push({
                        url: entry.url, kind: entry.kind, contract: entry.contract, status: "skip",
                        durationMs: 0, failures: [],
                        warnings: [`MEMORY_LOW: only ${freeMemoryMb()} MB free, page skipped`],
                        artifacts: [], skippedReason: "memory guard",
                    });
                    console.warn(`SKIP ${entry.url} (memory guard)`);
                    continue;
                }
                await breathe();

                try
                {
                    const result = await runEntry(entry);
                    results.push(result);
                    const codes = Array.from(new Set(result.failures.map(f => f.code))).join(",");
                    console.log(`${result.status === "pass" ? "PASS" : "FAIL"} ${entry.url}` +
                        ` (${((Date.now() - started) / 1000).toFixed(1)}s)` + (codes ? ` [${codes}]` : ""));
                }
                catch(e:any)
                {
                    results.push({
                        url: entry.url, kind: entry.kind, contract: entry.contract, status: "fail",
                        durationMs: Date.now() - started,
                        failures: [{ code: "INTERNAL", contract: entry.contract, message: String(e?.message ?? e) }],
                        warnings: [], artifacts: [],
                    });
                    console.error(`FAIL ${entry.url} (internal: ${e?.message ?? e})`);
                }
                saveProgress();
                await breathe(1000);
                await maybeBreak();
            }
        };

        await Promise.all(Array.from({ length: Math.min(workers, Math.max(1, queue.length)) }, () => worker()));
    }
    finally
    {
        await session.close();
        server?.stop();
    }

    results.sort((a, b) => a.url.localeCompare(b.url));
    saveProgress();

    if(updateBaselines)
    {
        for(const result of results)
        {
            const slug = slugOf(result.url);
            for(const file of result.artifacts)
            {
                if(!file.toLowerCase().endsWith(".png")) { continue; }
                const name = file.split(/[\\/]/).pop() as string;
                if(name.startsWith("render") || name === "page.png" || name.startsWith("example-"))
                {
                    copyBaseline(file, join(baselinesRoot, slug));
                }
            }
        }
    }

    const summary = {
        pages: results.length + missing.length,
        pass: results.filter(r => r.status === "pass").length,
        fail: results.filter(r => r.status === "fail").length + missing.length,
        skip: results.filter(r => r.status === "skip").length,
        warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
        failuresByCode: failureCounts(results),
    };
    if(missing.length > 0) { summary.failuresByCode["NOT_BUILT"] = missing.length; }

    const needsManual = results
        .filter(r => r.needsManual || r.warnings.some(w => w.startsWith("SETTINGS_INERT")))
        .map(r => ({
            url: r.url,
            reason: r.contract === "digital"
                ? "digital game: gameplay is not tested automatically"
                : "inert setting warning: a control changed but the output did not",
        }));

    const report:ReportData = {
        version: 1,
        generatedAt: new Date().toISOString(),
        seed,
        build,
        summary,
        results,
        needsManual,
    };
    writeReports(outDir, report);

    console.log(`\n${summary.pages} pages — ${summary.pass} pass, ${summary.fail} fail, ${summary.skip} skip, ${summary.warnings} warning(s)`);
    if(Object.keys(summary.failuresByCode).length > 0)
    {
        console.log("failures by code: " + Object.entries(summary.failuresByCode)
            .sort((a, b) => b[1] - a[1])
            .map(([code, count]) => `${code}=${count}`).join(", "));
    }
    console.log(`report: ${join(outDir, "report.md")} · contact sheet: ${join(outDir, "index.html")}`);

    return summary.fail > 0 ? 1 : 0;

    async function runEntry(entry:ManifestEntry) : Promise<PageResult>
    {
        if(entry.contract === "rulebook")
        {
            return await runRulebook(session, entry, {
                baseUrl, studioDir, artifactsRoot, baselinesRoot, updateBaselines,
                timeoutMs, exampleTimeoutMs, seed, allowlist,
            });
        }
        if(entry.contract === "generator")
        {
            return await runGenerator(session, entry, {
                baseUrl, artifactsRoot, timeoutMs, genTimeoutMs, seed, runs,
                inert: hasFlag("inert"), allowlist, auditPdf,
            });
        }
        if(entry.contract === "digital")
        {
            return await runDigital(session, entry, { baseUrl, artifactsRoot, timeoutMs, seed, allowlist });
        }
        return {
            url: entry.url, kind: entry.kind, contract: entry.contract, status: "skip",
            durationMs: 0, failures: [], warnings: [], artifacts: [],
            skippedReason: `unsupported kind ${entry.kind}`,
        };
    }
}

main()
    .then((code) => process.exit(code))
    .catch((error) =>
    {
        console.error("internal error:", error);
        process.exit(3);
    });
