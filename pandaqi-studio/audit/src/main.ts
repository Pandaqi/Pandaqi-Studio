import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildSite, lastLines, writeSegment } from "./build";
import { buildManifest, slugOf, writeManifest } from "./manifest";
import { startServer } from "./serve";
import { Session } from "./lib/browser";
import { runRulebook } from "./pages/rulebook";
import { runGenerator } from "./pages/generator";
import { runDigital } from "./pages/digital";
import { copyBaseline, failureCounts, writeReports } from "./lib/report";
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

const seed = argValue("seed", "audit-1") as string;
const timeoutMs = argNumber("timeout", 30000);
const genTimeoutMs = 240000;
const exampleTimeoutMs = 90000;
const workers = Math.max(1, argNumber("workers", 2));
const runs = Math.max(1, argNumber("runs", 2));
const kindFilter = argValue("kind");
const filter = argValue("filter");
const segment = argValue("segment");
const onlyFailing = hasFlag("only-failing");
const skipBuild = hasFlag("skip-build");
const baseUrlOverride = argValue("base-url");
const updateBaselines = hasFlag("update-baselines");
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

const main = async () : Promise<number> =>
{
    mkdirSync(outDir, { recursive: true });
    mkdirSync(artifactsRoot, { recursive: true });

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

    const session = await Session.launch({ headed: hasFlag("headed") });
    const results:PageResult[] = [];

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

    if(updateBaselines)
    {
        for(const result of results)
        {
            const slug = slugOf(result.url);
            for(const file of result.artifacts)
            {
                if(!file.toLowerCase().endsWith(".png")) { continue; }
                const name = file.split(/[\\/]/).pop() as string;
                if(name.startsWith("render-") || name === "page.png" || name.startsWith("example-"))
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
                baseUrl, artifactsRoot, baselinesRoot, updateBaselines,
                timeoutMs, exampleTimeoutMs, seed, allowlist,
            });
        }
        if(entry.contract === "generator")
        {
            return await runGenerator(session, entry, {
                baseUrl, artifactsRoot, timeoutMs, genTimeoutMs, seed, runs,
                inert: hasFlag("inert"), allowlist,
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
