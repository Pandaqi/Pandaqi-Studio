import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { writeSegment } from "./build";
import { acquireLock, waitForMemory } from "./lib/govern";

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const outDir = join(studioDir, "audit-artifacts");
const perfSite = join(outDir, "perf-site");
const fast = process.argv.includes("--fast");
const PORT = 1399;

const PROJECT = "chiptales/bet/noble-flood";
const MD = join(studioDir, "content", PROJECT, "game.md");
const TS = join(studioDir, "themes", "pandaqi", "assets", "games", PROJECT, "game", "main.ts");
const OUT_HTML = join(perfSite, PROJECT, "game", "index.html");
const OUT_BUNDLE = join(perfSite, "games", PROJECT, "game", "bundle.js");

const BUDGETS = { markdownMs: 2000, assetMs: 10000, fullMs: 150000, segmentMs: 90000 };

const hugoEnv = () => ({
    ...process.env,
    HUGO_PARAMS_ENABLEGAMEJS: "true",
    HUGO_PARAMS_ENABLEBOARDJS: "true",
});

const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));

// proc.kill() alone leaves the hugo server running on Windows, where it keeps watching the tree and
// rebuilding on every later edit — turning every measurement of this script into a lie.
const killServer = async (proc:any) =>
{
    if(!proc) { return; }
    try { proc.kill(); } catch(e) {}
    if(process.platform === "win32")
    {
        try {
            const child = Bun.spawn(["taskkill", "/F", "/T", "/PID", String(proc.pid)], { stdout: "ignore", stderr: "ignore" });
            await child.exited;
        } catch(e) {}
    }
    try { await proc.exited; } catch(e) {}
};

const waitForMtimeChange = async (file:string, previous:number, timeoutMs:number) : Promise<number|null> =>
{
    const start = Date.now();
    while(Date.now() - start < timeoutMs)
    {
        if(existsSync(file))
        {
            const now = statSync(file).mtimeMs;
            if(now !== previous) { return Date.now() - start; }
        }
        await sleep(100);
    }
    return null;
}

const touch = (file:string) =>
{
    const content = readFileSync(file);
    writeFileSync(file, content);
}

const run = async () =>
{
    if(!existsSync(MD) || !existsSync(TS))
    {
        console.error(`perf: fixture files missing (${MD} / ${TS})`);
        process.exit(3);
    }

    mkdirSync(outDir, { recursive: true });
    // one heavy thing at a time, on a machine that has room for it
    try { acquireLock(outDir, "perf"); }
    catch(e:any) { console.error(e.message); process.exit(4); }
    if(!(await waitForMemory(1500, 120000))) { console.error("perf: not enough free memory to measure"); process.exit(2); }

    // a cold destination, so "segment build" really measures a first build
    rmSync(perfSite, { recursive: true, force: true });
    mkdirSync(perfSite, { recursive: true });
    writeSegment(studioDir, PROJECT);

    const timings:Record<string, number|null> = {
        segmentMs: null, markdownMs: null, assetMs: null, fullMs: null,
    };

    console.log("starting hugo server (segment: " + PROJECT + ") …");
    const serverStart = Date.now();
    const server = Bun.spawn([
        "hugo", "server",
        "--port", String(PORT),
        "--disableKinds", "taxonomy,term,rss,sitemap",
        "--config", "config.toml,audit/lean.toml,audit/segment.toml",
        "--renderSegments", "one",
        "-d", perfSite,
        "--logLevel", "warn",
    ], { cwd: studioDir, env: hugoEnv(), stdout: "pipe", stderr: "pipe" });

    let serverExited = false;
    server.exited.then(() => { serverExited = true; });

    try
    {
        // 1. first build of the segment
        let ready = false;
        const readyStart = Date.now();
        while(Date.now() - readyStart < 300000 && !serverExited)
        {
            if(existsSync(OUT_HTML))
            {
                try
                {
                    const res = await fetch(`http://127.0.0.1:${PORT}/${PROJECT}/game/`);
                    if(res.ok) { ready = true; break; }
                }
                catch(e) { /* server still booting */ }
            }
            await sleep(250);
        }
        if(!ready)
        {
            console.error("perf: hugo server never became ready");
            console.error(`expected: ${OUT_HTML}`);
            const err = await new Response(server.stderr).text().catch(() => "");
            console.error(err.trimEnd().split(/\r?\n/).slice(-30).join("\n"));
            await killServer(server);
            process.exit(2);
        }
        timings.segmentMs = Date.now() - serverStart;
        console.log(`segment build: ${(timings.segmentMs / 1000).toFixed(1)} s`);

        // 2. a page markdown edit
        await sleep(500);
        let before = statSync(OUT_HTML).mtimeMs;
        touch(MD);
        timings.markdownMs = await waitForMtimeChange(OUT_HTML, before, 60000);
        console.log(`markdown edit: ${timings.markdownMs === null ? "timeout" : (timings.markdownMs / 1000).toFixed(1) + " s"}`);

        // 3. a game code edit
        await sleep(500);
        before = existsSync(OUT_BUNDLE) ? statSync(OUT_BUNDLE).mtimeMs : 0;
        touch(TS);
        timings.assetMs = await waitForMtimeChange(OUT_BUNDLE, before, 120000);
        console.log(`game code edit: ${timings.assetMs === null ? "timeout" : (timings.assetMs / 1000).toFixed(1) + " s"}`);
    }
    finally
    {
        await killServer(server);
    }

    // 4. full audit build
    if(!fast)
    {
        console.log("full audit build …");
        const start = Date.now();
        await waitForMemory(1500, 120000);
        const build = Bun.spawn([
            "hugo", "-d", join(outDir, "perf-full"),
            "--disableKinds", "taxonomy,term,rss,sitemap",
            "--config", "config.toml,audit/lean.toml",
            "--logLevel", "warn",
        ], { cwd: studioDir, env: hugoEnv(), stdout: "pipe", stderr: "pipe" });
        const [stdout, stderr] = await Promise.all([
            new Response(build.stdout).text(),
            new Response(build.stderr).text(),
        ]);
        const code = await build.exited;
        timings.fullMs = Date.now() - start;
        if(code !== 0)
        {
            console.error("perf: full build failed");
            console.error((stdout + stderr).trimEnd().split(/\r?\n/).slice(-40).join("\n"));
            process.exit(2);
        }
        console.log(`full build: ${(timings.fullMs / 1000).toFixed(1)} s`);
    }

    const rows = [
        ["segment build", timings.segmentMs, BUDGETS.segmentMs],
        ["markdown edit", timings.markdownMs, BUDGETS.markdownMs],
        ["game code edit", timings.assetMs, BUDGETS.assetMs],
        ["full build", timings.fullMs, BUDGETS.fullMs],
    ] as [string, number|null, number][];

    console.log("\n| step | measured | budget | status |");
    console.log("|---|---|---|---|");
    let failures = 0;
    for(const [label, value, budget] of rows)
    {
        if(value === null)
        {
            console.log(`| ${label} | ${fast && label === "full build" ? "skipped" : "timeout"} | ${(budget / 1000).toFixed(0)} s | ${fast && label === "full build" ? "—" : "FAIL"} |`);
            if(!(fast && label === "full build")) { failures++; }
            continue;
        }
        const status = value <= budget ? "ok" : "OVER";
        if(status === "OVER") { failures++; }
        console.log(`| ${label} | ${(value / 1000).toFixed(1)} s | ${(budget / 1000).toFixed(0)} s | ${status} |`);
    }

    writeFileSync(join(outDir, "perf.json"), JSON.stringify({
        generatedAt: new Date().toISOString(),
        project: PROJECT,
        fast,
        timings,
        budgets: BUDGETS,
    }, null, 2), "utf8");

    console.log(`\nresults written to ${join(outDir, "perf.json")}`);
    process.exit(failures > 0 ? 1 : 0);
}

run().catch((error) => {
    console.error("perf: internal error", error);
    process.exit(3);
});
