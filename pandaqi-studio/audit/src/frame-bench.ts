/* Realtime frame benchmark: how much of a 16.67 ms budget a game frame actually uses.
 *
 *   cd pandaqi-studio/audit
 *   bun run frame-bench                       # 250/500/1000/2000 entities, 120 frames each
 *   bun run frame-bench --counts=2000 --frames=240 --headed
 *
 * Writes audit-artifacts/frame-bench/results.json and audit/realtime-benchmark.md.
 */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { startServer } from "./serve";

const argValue = (name:string, fallback:string) =>
{
    const argv = process.argv.slice(2);
    const found = argv.find((arg) => arg.startsWith(`--${name}=`));
    if(found) { return found.split("=").slice(1).join("="); }
    const index = argv.indexOf(`--${name}`);
    if(index >= 0 && argv[index + 1]) { return argv[index + 1]; }
    return fallback;
};

const argNumber = (name:string, fallback:number) => Number(argValue(name, String(fallback)));

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const outDir = join(studioDir, "audit-artifacts", "frame-bench");
const siteDir = join(outDir, "site");
const reportPath = join(auditDir, "realtime-benchmark.md");

const COUNTS = argValue("counts", "250,500,1000,2000").split(",").map((value) => Number(value.trim())).filter((value) => value > 0);
const FRAMES = Math.max(10, argNumber("frames", 120));
const HEADED = process.argv.includes("--headed");
const PORT = argNumber("port", 4332);
const BUDGET_MS = 1000 / 60;

const MODES = ["idle", "components", "components-sprites", "layout", "default", "webgpu"] as const;
const SPIN = argValue("spin", "1") !== "0";
const DURATION = argNumber("duration", 1500);
// A desktop browser shares the machine with everything else, so one 1.5 s slice is noisy. Each
// (mode, count) runs REPEATS times, alternating the order, and the report keeps the median.
const REPEATS = Math.max(1, argNumber("repeats", 2));

const median = (values:number[]) =>
{
    if(values.length === 0) { return 0; }
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const percentile = (values:number[], fraction:number) =>
{
    if(values.length === 0) { return 0; }
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
};

const buildBundle = async () =>
{
    rmSync(siteDir, { recursive: true, force: true });
    mkdirSync(siteDir, { recursive: true });

    const libDir = join(studioDir, "assets", "lib", "pq-games");
    const pqGamesAlias = {
        name: "pq-games-alias",
        setup(build:any)
        {
            build.onResolve({ filter: /^lib\/pq-games($|\/)/ }, (args:any) =>
            {
                const sub = args.path.slice("lib/pq-games".length).replace(/^\//, "");
                if(!sub) { return { path: join(libDir, "index.ts") }; }
                if(sub.endsWith(".ts")) { return { path: join(libDir, sub) }; }
                if(existsSync(join(libDir, sub))) { return { path: join(libDir, sub, "index.ts") }; }
                return { path: join(libDir, `${sub}.ts`) };
            });
        },
    };

    const result = await Bun.build({
        entrypoints: [join(auditDir, "bench", "frameBenchEntry.ts")],
        outdir: siteDir,
        naming: "bench.js",
        target: "browser",
        format: "iife",
        minify: false,
        sourcemap: "none",
        plugins: [pqGamesAlias],
    });

    if(!result.success)
    {
        for(const log of result.logs) { console.error(String(log)); }
        process.exit(2);
    }

    // the demo page the hosted preview serves is built from the same entry
    writeFileSync(join(siteDir, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>pq-games realtime frame bench</title></head>
<body style="margin:0;background:#0b0d10;color:#cfd6e4;font:14px system-ui">
<p style="padding:8px">Measuring realtime frames…</p>
<script src="./bench.js"></script></body></html>
`, "utf8");

    const resultCopy = join(outDir, "bundle.js");
    cpSync(join(siteDir, "bench.js"), resultCopy);
}

const launchBrowser = async () =>
{
    const options:any = { headless: !HEADED, args: ["--disable-dev-shm-usage", "--disable-extensions", "--disable-background-networking"] };
    if(process.env.CHROME_PATH) { options.executablePath = process.env.CHROME_PATH; }
    else { options.channel = "chrome"; }
    return await chromium.launch(options);
}

interface ModeResult
{
    mode: string
    count: number
    skipped?: string
    fps?: number
    dispatchMedian?: number
    dispatchP95?: number
    frames: number
    info: any
}

const measure = async (browser:any, baseUrl:string, mode:string, count:number) : Promise<ModeResult> =>
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors:string[] = [];
    page.on("pageerror", (error:any) => errors.push(String(error?.message ?? error)));
    page.on("console", (message:any) => {
        if(message.type() !== "error" || /^Failed to load resource/i.test(message.text())) { return; }
        errors.push(message.text());
    });

    try
    {
        await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });
        const info = await page.evaluate(
            async (options:any) => (window as any).pqFrameBench?.prepare(options),
            { mode, count, spin: SPIN },
        );

        const result = await page.evaluate(
            async (options:any) => (window as any).pqFrameBench.runLive(options),
            { mode, frames: DURATION, spin: SPIN },
        );

        if(errors.length > 0) { console.warn(`  [${mode}] page errors: ${errors.slice(0, 3).join(" | ")}`); }

        return {
            mode,
            count,
            skipped: result?.skipped,
            fps: result?.fps ?? 0,
            dispatchMedian: result?.dispatchMedian ?? 0,
            dispatchP95: result?.dispatchP95 ?? 0,
            frames: result?.frames ?? 0,
            info,
        };
    }
    finally
    {
        await page.close().catch(() => {});
    }
};

const main = async () =>
{
    console.log(`bundling frame bench (${COUNTS.join(", ")} entities × ${FRAMES} frames) …`);
    await buildBundle();

    const server = startServer(siteDir, PORT);
    console.log(`serving ${siteDir} at ${server.url}`);

    const browser = await launchBrowser();
    const browserVersion = browser.version();
    const results:ModeResult[] = [];
    let adapter:any = null;

    const raw:ModeResult[] = [];

    try
    {
        for(let round = 0; round < REPEATS; round++)
        {
            const counts = round % 2 === 0 ? COUNTS : [...COUNTS].reverse();
            for(const count of counts)
            {
                for(const mode of MODES)
                {
                    process.stdout.write(`  r${round + 1} ${count.toString().padStart(5)} · ${mode.padEnd(18)} … `);
                    try
                    {
                        const result = await measure(browser, server.url, mode, count);
                        raw.push(result);
                        adapter = result.info?.adapter ?? adapter;
                        if(result.skipped) { console.log(`skipped (${result.skipped})`); continue; }
                        console.log(`${(result.fps as number).toFixed(0)} FPS (draw calls ${(result.dispatchMedian as number).toFixed(2)} ms)`);
                    }
                    catch(error)
                    {
                        const message = String((error as Error)?.message ?? error).slice(0, 180);
                        console.log(`failed (${message})`);
                        raw.push({ mode, count, skipped: message, frames: 0, info: null });
                    }
                }
            }
        }
    }
    finally
    {
        await browser.close().catch(() => {});
        server.stop();
    }

    // median over the rounds per (mode, count); a skipped run stays skipped
    for(const count of COUNTS)
    {
        for(const mode of MODES)
        {
            const runs = raw.filter((entry) => entry.mode === mode && entry.count === count);
            if(runs.length === 0) { continue; }
            const usable = runs.filter((entry) => !entry.skipped);
            if(usable.length === 0) { results.push(runs[0]); continue; }
            results.push({
                mode, count,
                fps: median(usable.map((entry) => entry.fps as number)),
                dispatchMedian: median(usable.map((entry) => entry.dispatchMedian as number)),
                dispatchP95: median(usable.map((entry) => entry.dispatchP95 as number)),
                frames: usable[0].frames,
                info: usable[0].info,
            });
        }
    }

    const generatedAt = new Date().toISOString();
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "results.json"), JSON.stringify({ generatedAt, counts: COUNTS, durationMs: DURATION, repeats: REPEATS, headed: HEADED, spin: SPIN, adapter, results, raw }, null, 2), "utf8");

    const value = (mode:string, count:number) => results.find((result) => result.mode === mode && result.count === count);
    const modeLabels:Record<string,string> = {
        "idle": "idle (ceiling: rAF with no drawing)",
        "components": "components (FULL_PRESET: sprites + shapes + text)",
        "components-sprites": "components (SPRITE_PRESET only)",
        "layout": "RendererPandaqi + LayoutOperation tree",
        "default": "createRenderer() + LayoutOperation tree",
        "webgpu": "WebGPUSpriteBatch",
    };

    const ceiling = (results.find((result) => result.mode === "idle")?.fps as number) || 60;
    const sixty = ceiling - 1.5;

    const tableRows = [];
    for(const count of COUNTS)
    {
        for(const mode of MODES)
        {
            const result = value(mode, count);
            if(!result) { continue; }
            if(result.skipped) { tableRows.push(`| ${count} | ${modeLabels[mode]} | — | — | ${String(result.skipped).slice(0, 60)} |`); continue; }
            const fps = result.fps as number;
            const verdict = fps >= sixty
                ? `**60 FPS** (ceiling ${ceiling.toFixed(0)})`
                : fps >= ceiling * 0.9 ? `near 60 (${fps.toFixed(0)} FPS, ceiling ${ceiling.toFixed(0)})`
                : `${fps.toFixed(0)} FPS — below the ceiling`;
            tableRows.push(`| ${count} | ${modeLabels[mode]} | ${(result.dispatchMedian as number).toFixed(2)} | ${fps.toFixed(0)} | ${verdict} |`);
        }
    }

    const components500 = value("components", 500);
    const components1000 = value("components", 1000);
    const layout500 = value("layout", 500);
    const layout1000 = value("layout", 1000);
    const hasComponents = components500 && !components500.skipped && components1000 && !components1000.skipped;
    const summary = hasComponents
        ? `The component drawer holds **${(components500.fps as number).toFixed(0)} FPS at 500 entities** and **${(components1000.fps as number).toFixed(0)} FPS at 1000** on this machine`
            + (layout500 && !layout500.skipped && layout1000 && !layout1000.skipped
                ? `; the LayoutOperation tree manages **${(layout500.fps as number).toFixed(0)} FPS** and **${(layout1000.fps as number).toFixed(0)} FPS** on the same scenes.`
                : ".")
        : "See the table for the measured frame rates.";

    const idleRow = results.find((result) => result.mode === "idle" && !result.skipped);
    const webgpuRow = results.find((result) => result.mode === "webgpu" && !result.skipped);
    const webgpuNote = webgpuRow
        ? `WebGPU measured on this machine: ${(webgpuRow.fps as number).toFixed(0)} FPS at ${webgpuRow.count} entities.`
        : `WebGPU could not be measured on this machine (${results.find((result) => result.mode === "webgpu")?.skipped ?? "no adapter"}); the GPU batch is untested here and the canvas fallback is what ran.`;

    const markdown = `# Realtime frames — pq-games

Generated by \`bun run frame-bench\` (${generatedAt}). This file is regenerated by that command.

- **Canvas:** ${WIDTH_TEXT}, attached to the page and presented every frame
- **Run:** ${DURATION} ms of \`requestAnimationFrame\` per mode, ${REPEATS} interleaved rounds; FPS is the median of the rounds, counted as frames the browser actually presented
- **Motion:** ${SPIN ? "every entity rotates each frame (worst case for a 2D canvas)" : "translation only (blit-only cost)"}
- **Machine/browser:** ${HEADED ? "headed" : "headless"} Chrome ${browserVersion}
- **WebGPU adapter:** ${adapter ? `${adapter.vendor ?? "?"} · ${adapter.architecture ?? "?"} · ${adapter.description ?? "?"}` : "not available"}
- **Display ceiling (idle row):** ${idleRow ? `${(idleRow.fps as number).toFixed(0)} FPS` : "unknown"} — the fastest this harness can present anything

| entities | mode | draw calls ms/frame | observed FPS | verdict |
| --- | --- | --- | --- | --- |
${tableRows.join("\n")}

${summary}

${webgpuNote}

## What this measures

A game frame is: animate the entity list, then draw it. The component drawer applies a transform per
entity, sets effects only when they change, and draws one sprite/shape/text. The LayoutOperation path
builds the same scene as \`ResourceGroup\` + \`LayoutOperation\` and draws it through
\`RendererPandaqi\`, which re-calculates and re-applies every operation on every frame.

- **draw calls ms/frame** — the median time the loop spends issuing draws. Rasterization happens
  after that, so a low number here is not yet a 60 FPS verdict.
- **observed FPS** — frames presented per second by \`requestAnimationFrame\`. This is the verdict:
  a loop that overruns its budget presents fewer frames.
- **p95** per-frame draw time is kept in the raw JSON next to the run.

The scene is deliberately generic (moving, rotating 48 px sprites on a 1280x720 canvas, a few shapes
and text labels) so the numbers describe the drawing path rather than one particular game.

## Caveats

- These are draw costs, not a full game loop: physics, input and audio assemble outside this timer.
- The browser presents at most one frame per display refresh, so \`observed FPS\` cannot exceed the
  idle ceiling. A result equal to the ceiling means "fits the budget", not "exactly this many FPS".
- Frame time on this machine is CPU-bound for the canvas drawer; the GPU batch is only exercised where
  \`navigator.gpu\` provides an adapter.
`;

    writeFileSync(reportPath, markdown, "utf8");
    console.log(`\nreport: ${reportPath}`);
    console.log(`raw:    ${join(outDir, "results.json")}`);
}

const WIDTH_TEXT = "1280x720";

main().catch((error) =>
{
    console.error("frame-bench: internal error", error);
    process.exit(3);
});
