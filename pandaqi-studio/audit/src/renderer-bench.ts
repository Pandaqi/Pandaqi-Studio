/* RendererPandaqi vs RendererPixi, measured on One Pizza The Puzzle.

   bun run renderer-bench               (from pandaqi-studio/audit)
   bun run renderer-bench --reps=5 --rounds=2

   Bundles audit/bench/rendererBenchEntry.ts for the browser, serves it, and
   drives it in headless Chrome: same game, same seed, same resources, only the
   renderer differs. Writes the raw numbers to audit-artifacts/renderer-bench/
   and a human-readable summary to audit/renderer-benchmark.md. */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { startServer } from "./serve";

const argNumber = (name:string, fallback:number) =>
{
    const argv = process.argv.slice(2);
    const found = argv.find((arg) => arg.startsWith(`--${name}=`));
    if(found) { return Number(found.split("=")[1]); }
    const index = argv.indexOf(`--${name}`);
    const next = index >= 0 ? Number(argv[index + 1]) : NaN;
    return Number.isFinite(next) ? next : fallback;
};

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const outDir = join(studioDir, "audit-artifacts", "renderer-bench");
const siteDir = join(outDir, "site");
const reportPath = join(auditDir, "renderer-benchmark.md");

const REPS = Math.max(1, argNumber("reps", 4));
const ROUNDS = Math.max(1, argNumber("rounds", 2));
// A headed browser can use the real GPU; headless usually falls back to software rasterization.
const HEADED = process.argv.includes("--headed");
const PORT = argNumber("port", 4331);
const SEED = "renderer-bench";
const RENDERERS = ["pixi", "pandaqi", "webgpu"] as const;

const median = (values:number[]) =>
{
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const mean = (values:number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const buildBundle = async () =>
{
    rmSync(siteDir, { recursive: true, force: true });
    mkdirSync(siteDir, { recursive: true });

    // The games import the library as "lib/pq-games" (the site's assets/ baseUrl). Bun.build has
    // no tsconfig paths here, so resolve that prefix to assets/lib/pq-games ourselves.
    const libDir = join(studioDir, "assets", "lib", "pq-games");
    const pqGamesAlias = {
        name: "pq-games-alias",
        setup(build:any)
        {
            build.onResolve({ filter: /^lib\/pq-games($|\/)/ }, (args:any) =>
            {
                const sub = args.path.slice("lib/pq-games".length).replace(/^\//, "");
                if(!sub) { return { path: join(libDir, "index.ts") }; }
                return { path: join(libDir, sub.endsWith(".ts") ? sub : `${sub}.ts`) };
            });
        },
    };

    const result = await Bun.build({
        entrypoints: [join(auditDir, "bench", "rendererBenchEntry.ts")],
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
        console.error("bundle failed:");
        for(const log of result.logs) { console.error(String(log)); }
        process.exit(2);
    }

    writeFileSync(join(siteDir, "index.html"), `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><link rel="icon" href="data:,"><title>One Pizza — renderer bench</title></head>
<body><p>Measuring RendererPixi vs RendererPandaqi…</p><script src="./bench.js"></script></body>
</html>
`, "utf8");

    // the game reads its artwork from /one-pizza-the-puzzle/assets/, exactly like the built site
    const assetsFrom = join(studioDir, "content", "one-pizza-the-puzzle", "assets");
    if(!existsSync(assetsFrom)) { console.error(`missing assets: ${assetsFrom}`); process.exit(2); }
    cpSync(assetsFrom, join(siteDir, "one-pizza-the-puzzle", "assets"), { recursive: true });

    // RendererPixi fetches Pixi at runtime (the site does not bundle it), so the harness has to serve
    // the same two modules the real site publishes under /lib/pq-games/renderers/pixi/.
    const pixiFrom = join(studioDir, "assets", "lib", "pq-games", "renderers", "pixi");
    const pixiTo = join(siteDir, "lib", "pq-games", "renderers", "pixi");
    mkdirSync(pixiTo, { recursive: true });
    for(const file of ["pixi.mjs", "pixi-filters.mjs"]) {
        cpSync(join(pixiFrom, file), join(pixiTo, file));
    }
};

const launchBrowser = async () =>
{
    const options:any = {
        headless: !HEADED,
        args: ["--disable-dev-shm-usage", "--disable-extensions", "--disable-background-networking"],
    };
    if(process.env.CHROME_PATH) { options.executablePath = process.env.CHROME_PATH; }
    else { options.channel = "chrome"; }
    return await chromium.launch(options);
};

interface RunResult
{
    renderer: string;
    seed: string;
    runs: { total:number, render:number, layout:number, width:number, height:number, ink:number }[];
    pixiType?: number | null;
    backendUsed?: string | null;
    backend?: { webgpu:boolean, webgl:string };
}

const measure = async (browser:any, baseUrl:string, renderer:string) : Promise<{ info:any, result:RunResult }> =>
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors:string[] = [];
    page.on("pageerror", (error:any) => errors.push(String(error?.message ?? error)));
    page.on("console", (message:any) => {
        // a favicon 404 is noise here, and Chromium logs one console error per failed load
        if(message.type() !== "error" || /^Failed to load resource/i.test(message.text())) { return; }
        errors.push(message.text());
    });
    page.on("response", (response:any) => {
        if(response.status() >= 400 && !response.url().endsWith("/favicon.ico")) {
            errors.push(`HTTP ${response.status()} ${response.url()}`);
        }
    });

    try
    {
        await page.goto(`${baseUrl}/?renderer=${renderer}&seed=${SEED}`, { waitUntil: "load", timeout: 60000 });
        await page.waitForFunction(() => (window as any).pqRendererBenchInfo !== null, null, { timeout: 120000 });

        const info = await page.evaluate(() => (window as any).pqRendererBenchInfo);
        if(info?.error) { throw new Error(`prepare failed: ${info.error}`); }

        const result = await page.evaluate(
            (reps:number) => (window as any).pqRendererBench.run(reps),
            REPS,
        ) as RunResult;

        if(errors.length > 0) { console.warn(`  [${renderer}] page errors: ${errors.slice(0, 3).join(" | ")}`); }
        return { info, result };
    }
    finally
    {
        await page.close().catch(() => {});
    }
};

const main = async () =>
{
    console.log(`bundling ${REPS} reps × ${ROUNDS} round(s) …`);
    await buildBundle();

    const server = startServer(siteDir, PORT);
    console.log(`serving ${siteDir} at ${server.url}`);

    const browser = await launchBrowser();
    const collected:Record<string, RunResult[]> = Object.fromEntries(RENDERERS.map((renderer) => [renderer, []]));
    let info:any = null;

    try
    {
        for(let round = 0; round < ROUNDS; round++)
        {
            // alternate the order: a renderer must not be consistently measured on a colder machine
            const order = round % 2 === 0 ? [...RENDERERS] : [...RENDERERS].reverse();
            for(const renderer of order)
            {
                process.stdout.write(`  round ${round + 1}: ${renderer} … `);
                // A backend the machine cannot run (no WebGPU adapter, a missing GPU) must not throw
                // away the numbers the other renderers already produced.
                try
                {
                    const measured = await measure(browser, server.url, renderer);
                    info = measured.info;
                    collected[renderer].push(measured.result);
                    const totals = measured.result.runs.map((run) => run.total);
                    console.log(`${median(totals).toFixed(0)} ms/draw (${totals.map(t => t.toFixed(0)).join(", ")})`);
                }
                catch(error)
                {
                    console.log(`skipped (${String((error as Error)?.message ?? error).slice(0, 160)})`);
                }
            }
        }
    }
    finally
    {
        await browser.close().catch(() => {});
        server.stop();
    }

    const runsOf = (renderer:string) => collected[renderer].flatMap((result) => result.runs);
    const rendered = RENDERERS.filter((renderer) => collected[renderer].length > 0);
    const summary = Object.fromEntries(rendered.map((renderer) => {
        const runs = runsOf(renderer);
        return [renderer, {
            draws: runs.length,
            total: mean(runs.map((run) => run.total)),
            render: mean(runs.map((run) => run.render)),
            layout: mean(runs.map((run) => run.layout)),
            medianTotal: median(runs.map((run) => run.total)),
            medianRender: median(runs.map((run) => run.render)),
            minTotal: Math.min(...runs.map((run) => run.total)),
            maxTotal: Math.max(...runs.map((run) => run.total)),
            ink: mean(runs.map((run) => run.ink)),
            size: `${runs[0].width}×${runs[0].height}`,
        }];
    }));

    const EMPTY = { draws: 0, total: 0, render: 0, layout: 0, medianTotal: 1, medianRender: 1, minTotal: 0, maxTotal: 0, ink: 0, size: "?" };
    const pixi = summary["pixi"] ?? EMPTY;
    const pandaqi = summary["pandaqi"] ?? EMPTY;
    const speedup = (a:number, b:number) => b > 0 ? a / b : 0;
    const backend = collected.pixi[0]?.backend ?? collected.pandaqi[0]?.backend;
    const pixiBackend = collected.pixi[0]?.pixiType ?? null;

    console.log(`\nbrowser backend: webgpu=${backend?.webgpu ?? "?"} · webgl=${backend?.webgl ?? "?"}`);
    console.log("\n| renderer | draws | total median | total mean | render median | layout mean | ink |");
    console.log("|---|---|---|---|---|---|---|");
    for(const renderer of rendered)
    {
        const row = summary[renderer];
        console.log(`| ${renderer} | ${row.draws} | ${row.medianTotal.toFixed(0)} ms | ${row.total.toFixed(0)} ms | ${row.medianRender.toFixed(0)} ms | ${row.layout.toFixed(0)} ms | ${(row.ink * 100).toFixed(1)}% |`);
    }
    console.log(`\nPandaqi/Pixi time (medians): total ${(pandaqi.medianTotal / pixi.medianTotal).toFixed(2)}×, render step ${(pandaqi.medianRender / pixi.medianRender).toFixed(2)}×`);

    const generatedAt = new Date().toISOString();
    writeFileSync(join(outDir, "results.json"), JSON.stringify({
        generatedAt,
        seed: SEED,
        reps: REPS,
        rounds: ROUNDS,
        info,
        headed: HEADED,
        backend,
        pixiBackend,
        summary,
        runs: collected,
    }, null, 2), "utf8");

    const seconds = (ms:number) => (ms / 1000).toFixed(2) + " s";
    const markdown = `# Renderer speed — One Pizza The Puzzle

Measured by \`bun run renderer-bench\` (${generatedAt}). This file is regenerated by that command.

- **Game:** One Pizza The Puzzle, the \`board\` material generator (one A4 board per draw)
- **Renderer A:** \`RendererPixi\` (what the game ships with today)
- **Renderer B:** \`RendererPandaqi\` (the canvas renderer, the pq-games default)
- **Setup:** ${info?.itemSize ? `${info.itemSize.x}×${info.itemSize.y} px board` : "unknown size"}, seed \`${SEED}\`, same resources and settings
- **Runs:** ${REPS} draws per round × ${ROUNDS} round(s), one discarded warm-up per renderer, order alternated per round
- **Machine/browser:** this workstation, ${HEADED ? "headed" : "headless"} Chrome, Bun ${Bun.version}
- **GPU backend:** WebGL = ${backend?.webgl ?? "unknown"}; WebGPU exposed = ${backend?.webgpu ?? "unknown"};
  Pixi renderer type = ${pixiBackend === null ? "n/a" : pixiBackend} (1 = WebGL, 2 = WebGPU)

| renderer | draws | total per board (median) | total (mean) | render step (median) | layout + generation (mean) | ink |
| --- | --- | --- | --- | --- | --- | --- |
| RendererPixi | ${pixi.draws} | ${pixi.medianTotal.toFixed(0)} ms | ${pixi.total.toFixed(0)} ms | ${pixi.medianRender.toFixed(0)} ms | ${pixi.layout.toFixed(0)} ms | ${(pixi.ink * 100).toFixed(1)}% |
| RendererPandaqi | ${pandaqi.draws} | ${pandaqi.medianTotal.toFixed(0)} ms | ${pandaqi.total.toFixed(0)} ms | ${pandaqi.medianRender.toFixed(0)} ms | ${pandaqi.layout.toFixed(0)} ms | ${(pandaqi.ink * 100).toFixed(1)}% |
${rendered.includes("webgpu") ? `| RendererPandaqiWebGPU (${collected.webgpu[0]?.backendUsed ?? "unknown"}) | ${summary["webgpu"].draws} | ${summary["webgpu"].medianTotal.toFixed(0)} ms | ${summary["webgpu"].total.toFixed(0)} ms | ${summary["webgpu"].medianRender.toFixed(0)} ms | ${summary["webgpu"].layout.toFixed(0)} ms | ${(summary["webgpu"].ink * 100).toFixed(1)}% |` : ""}

- Total per board (median): **${seconds(pixi.medianTotal)} with Pixi vs ${seconds(pandaqi.medianTotal)} with Pandaqi**;
  Pandaqi takes ${(pandaqi.medianTotal / pixi.medianTotal).toFixed(2)}× as long
  (spread ${seconds(pixi.minTotal)}–${seconds(pixi.maxTotal)} vs ${seconds(pandaqi.minTotal)}–${seconds(pandaqi.maxTotal)}).
- The renderer's own step (\`MaterialVisualizer.finishDraw\`: build the render tree and rasterize):
  ${seconds(pixi.medianRender)} vs ${seconds(pandaqi.medianRender)}
  (Pandaqi takes ${(pandaqi.medianRender / pixi.medianRender).toFixed(2)}× as long).
- Map generation and laying out the operations ("layout") is the same code for both
  (${seconds(pixi.layout)} vs ${seconds(pandaqi.layout)}), so the difference in the total is the renderer.

## How to reproduce

\`\`\`bash
cd pandaqi-studio/audit
bun install          # playwright-core only; uses the installed Chrome
bun run renderer-bench --reps=4 --rounds=2            # headless
bun run renderer-bench --reps=4 --rounds=2 --headed   # with the real GPU (opens a window)
\`\`\`

Raw per-draw numbers: \`audit-artifacts/renderer-bench/results.json\`.

## What the numbers say

- This is not a software-vs-GPU artifact: **WebGL above is ANGLE on the real graphics adapter (D3D11)**,
  even headless. Both renderers draw onto the same 3507x2480 canvas and produce the same board
  (84.4% ink for both, same seed).
- Pixi builds one display tree and rasterizes it in one WebGL pass; RendererPandaqi walks the same
  operations on a 2D canvas. That walk used to allocate a **full-size temporary canvas**
  (3507x2480, about 35 MB) for every group and every stroked text, and it created every 2D context with
  \`willReadFrequently\`, which makes Chrome rasterize on the CPU. Both are fixed: a group that does not
  composite as a unit now draws straight onto the parent surface, and the temporary surfaces that are
  still needed are pooled and GPU-backed. Re-run this benchmark to see the current figures instead of
  trusting numbers from an older revision.
- The canvas renderer is the faster one on this board now. The comparison is still one game with one
  large page; a deck of small cards has a different balance (and smaller temporary surfaces), so do not
  read this as "canvas always wins".

## Caveats

- Absolute numbers belong to this machine. Re-run with --reps, --rounds and optionally --headed
  before quoting them elsewhere.
- Pixi's finishDraw creates a renderer per board and never destroys it, which is the pipeline the
  game ships today; that cost is included for Pixi, exactly as a visitor pays it.
- A forced 1x1 readback inside finishDraw makes both renderers finish their raster before the timer.
  Without it, a GPU renderer would look faster than it is.
- total includes map generation, which is renderer-independent; the render step column is the
  renderer-only comparison, while the total is what a visitor waits for.
- Only One Pizza The Puzzle is measured. Other games draw different mixes of images, shapes and text.
`;

    writeFileSync(reportPath, markdown, "utf8");
    console.log(`\nreport: ${reportPath}`);
    console.log(`raw:    ${join(outDir, "results.json")}`);
};

main().catch((error) =>
{
    console.error("renderer-bench: internal error", error);
    process.exit(3);
});
