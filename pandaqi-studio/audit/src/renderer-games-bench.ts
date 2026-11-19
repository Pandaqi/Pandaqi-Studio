/* Renderer comparison across several games.

   bun run renderer-games-bench                       (from pandaqi-studio/audit)
   bun run renderer-games-bench --reps=3 --rounds=2
   bun run renderer-games-bench --games=the-mist,kangaruse

   Runs each game's real `board` generator with three renderers and writes
   audit/renderer-games-benchmark.md plus the raw numbers in
   audit-artifacts/renderer-games-bench/results.json.

   The point of the third renderer (`legacy`) is before/after: it is RendererPandaqi as it existed
   before the optimization pass, so the difference between `legacy` and `pandaqi` is the work done to
   the renderer, not a different scene. `pixi` is the reference every game shipped with before the
   switch to Pandaqi. */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { startServer } from "./serve";

const argValue = (name:string, fallback:string) =>
{
    const argv = process.argv.slice(2);
    const found = argv.find((arg) => arg.startsWith(`--${name}=`));
    if(found) { return found.slice(name.length + 3); }
    const index = argv.indexOf(`--${name}`);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const argNumber = (name:string, fallback:number) => Number(argValue(name, String(fallback))) || fallback;

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const outDir = join(studioDir, "audit-artifacts", "renderer-games-bench");
const siteDir = join(outDir, "site");
const reportPath = join(auditDir, "renderer-games-benchmark.md");

const REPS = Math.max(1, argNumber("reps", 3));
const ROUNDS = Math.max(1, argNumber("rounds", 2));
const PORT = argNumber("port", 4333);
const SEED = "renderer-games-bench";
const HEADED = process.argv.includes("--headed");

// starry-skylines and the-mist are not in the default set: the first throws in the canvas path when
// driven outside its page, and the second's generator loops in a headless harness. Both stay in the
// entry's registry so `--games=...` can still be used to investigate them.
const DEFAULT_GAMES = [
    "one-pizza-the-puzzle",
    "magnetmen",
    "unstable-universe",
    "kangaruse",
    "timely-transports",
];
const GAMES = argValue("games", DEFAULT_GAMES.join(",")).split(",").filter(Boolean);
const RENDERERS = ["pixi", "legacy", "pandaqi"];

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
        entrypoints: [join(auditDir, "bench", "rendererGamesEntry.ts")],
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
<head><meta charset="utf-8"><link rel="icon" href="data:,"><title>pq-games — multi-game renderer bench</title></head>
<body><p>Measuring renderers…</p><script src="./bench.js"></script></body>
</html>
`, "utf8");

    for(const game of GAMES)
    {
        // the generator reads its artwork from /<game>/assets/, exactly like the built site
        const assetsFrom = join(studioDir, "content", game, "assets");
        if(!existsSync(assetsFrom)) { console.error(`missing assets: ${assetsFrom}`); process.exit(2); }
        cpSync(assetsFrom, join(siteDir, game, "assets"), { recursive: true });
    }

    // RendererPixi fetches Pixi at runtime (the site does not bundle it)
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
    game: string;
    renderer: string;
    runs: { total:number, render:number, layout:number, width:number, height:number, ink:number }[];
    pixiType?: number | null;
    backend?: { webgpu:boolean, webgl:string };
}

const measure = async (browser:any, baseUrl:string, game:string, renderer:string) : Promise<{ info:any, result:RunResult }> =>
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors:string[] = [];
    page.on("pageerror", (error:any) => errors.push(String(error?.message ?? error)));
    page.on("console", (message:any) => {
        if(message.type() !== "error" || /^Failed to load resource/i.test(message.text())) { return; }
        errors.push(message.text());
    });

    // A generator that loops forever (or a renderer that deadlocks) must not stall the whole run: the
    // page is closed on timeout, which also kills its script.
    let timer:any = null;
    const deadline = new Promise<never>((_, reject) =>
    {
        timer = setTimeout(() => reject(new Error("timed out after 120 s")), 120000);
    });

    try
    {
        const work = async () =>
        {
            await page.goto(`${baseUrl}/?renderer=${renderer}&game=${game}&seed=${SEED}`, { waitUntil: "load", timeout: 60000 });
            await page.waitForFunction(() => (window as any).pqRendererGamesBenchInfo !== null, null, { timeout: 60000 });

            const info = await page.evaluate(() => (window as any).pqRendererGamesBenchInfo);
            if(info?.error) { throw new Error(String(info.error).split("\n")[0]); }

            const result = await page.evaluate(
                (reps:number) => (window as any).pqRendererGamesBench.run(reps),
                REPS,
            ) as RunResult;

            return { info, result };
        };

        let outcome;
        try { outcome = await Promise.race([work(), deadline]); }
        catch(error) {
            // the page's own console output usually names the real cause of a throw
            const detail = errors.slice(0, 2).join(" | ");
            if(detail) { throw new Error(`${String((error as Error)?.message ?? error)} — console: ${detail}`); }
            throw error;
        }
        const { info, result } = outcome;

        if(errors.length > 0) { console.warn(`  [${game}/${renderer}] page errors: ${errors.slice(0, 2).join(" | ")}`); }
        return { info, result };
    }
    finally
    {
        await page.close().catch(() => {});
    }
};

const main = async () =>
{
    console.log(`bundling ${GAMES.length} game(s) · ${REPS} reps × ${ROUNDS} round(s) …`);
    await buildBundle();

    const server = startServer(siteDir, PORT);
    console.log(`serving ${siteDir} at ${server.url}`);

    const browser = await launchBrowser();
    const collected:Record<string, Record<string, RunResult[]>> = {};
    let backend:any = null;

    try
    {
        for(let round = 0; round < ROUNDS; round++)
        {
            for(const game of GAMES)
            {
                collected[game] ??= Object.fromEntries(RENDERERS.map((renderer) => [renderer, []]));
                // alternate the order per round, so a renderer is not always measured on a colder machine
                const order = round % 2 === 0 ? [...RENDERERS] : [...RENDERERS].reverse();
                for(const renderer of order)
                {
                    process.stdout.write(`  round ${round + 1} ${game} ${renderer} … `);
                    try
                    {
                        const measured = await measure(browser, server.url, game, renderer);
                        backend = measured.result.backend ?? backend;
                        collected[game][renderer].push(measured.result);
                        const totals = measured.result.runs.map((run) => run.total);
                        console.log(`${median(totals).toFixed(0)} ms/draw`);
                    }
                    catch(error)
                    {
                        const message = String((error as Error)?.message ?? error).slice(0, 180);
                        console.log(`skipped (${message})`);
                        collected[game][renderer] = collected[game][renderer] ?? [];
                        (collected[game] as any)[`${renderer}Error`] = message;
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

    const summarise = (result:RunResult) =>
    {
        const runs = result.runs;
        return {
            draws: runs.length,
            medianTotal: median(runs.map((run) => run.total)),
            meanTotal: mean(runs.map((run) => run.total)),
            medianRender: median(runs.map((run) => run.render)),
            meanRender: mean(runs.map((run) => run.render)),
            meanLayout: mean(runs.map((run) => run.layout)),
            minTotal: Math.min(...runs.map((run) => run.total)),
            maxTotal: Math.max(...runs.map((run) => run.total)),
            ink: mean(runs.map((run) => run.ink)),
            size: `${runs[0].width}×${runs[0].height}`,
        };
    };

    const summary:Record<string, any> = {};
    for(const game of GAMES)
    {
        summary[game] = {};
        for(const renderer of RENDERERS)
        {
            const results = collected[game]?.[renderer] ?? [];
            const runs = results.flatMap((result) => result.runs);
            summary[game][renderer] = runs.length > 0
                ? summarise({ game, renderer, runs })
                : { error: (collected[game] as any)?.[`${renderer}Error`] ?? "no runs" };
        }
    }

    const generatedAt = new Date().toISOString();
    writeFileSync(join(outDir, "results.json"), JSON.stringify({
        generatedAt, seed: SEED, reps: REPS, rounds: ROUNDS, headed: HEADED, backend, summary,
    }, null, 2), "utf8");

    const seconds = (ms:number) => (ms / 1000).toFixed(2) + " s";
    const lines = [
        `# Renderers across games`,
        ``,
        `Measured by \`bun run renderer-games-bench\` (${generatedAt}). This file is regenerated by that command.`,
        ``,
        `Each row runs the game's real \`board\` generator with the same seed and resources; only the renderer differs.`,
        `\`legacy\` is RendererPandaqi before the optimization pass (git \`796c539e\`), so \`legacy → pandaqi\` is the`,
        `before/after of the renderer work itself. \`pixi\` is what every game shipped with before the switch.`,
        ``,
        `- Runs: ${REPS} draws per round × ${ROUNDS} round(s), one discarded warm-up per page, order alternated per round`,
        `- Machine/browser: this workstation, ${HEADED ? "headed" : "headless"} Chrome, Bun ${Bun.version}`,
        `- GPU backend: WebGL = ${backend?.webgl ?? "unknown"}; WebGPU exposed = ${backend?.webgpu ?? "unknown"}`,
        ``,
        `| game | page | renderer | total (median) | render step (median) | layout (mean) | ink | vs legacy |`,
        `| --- | --- | --- | --- | --- | --- | --- | --- |`,
    ];

    for(const game of GAMES)
    {
        const rows = summary[game];
        const base = rows.legacy?.medianTotal;
        for(const renderer of RENDERERS)
        {
            const row = rows[renderer];
            if(row.error) { lines.push(`| ${game} | ? | ${renderer} | failed: ${row.error} | | | | |`); continue; }
            const ratio = base && renderer !== "legacy" ? (row.medianTotal / base).toFixed(2) + "×" : "—";
            lines.push(`| ${game} | ${row.size} | ${renderer} | ${row.medianTotal.toFixed(0)} ms | ${row.medianRender.toFixed(0)} ms | ${row.meanLayout.toFixed(0)} ms | ${(row.ink * 100).toFixed(1)}% | ${ratio} |`);
        }
    }

    lines.push(
        ``,
        `## How to reproduce`,
        ``,
        '```bash',
        `cd pandaqi-studio/audit`,
        `bun run renderer-games-bench --reps=3 --rounds=2`,
        `bun run renderer-games-bench --games=the-mist,kangaruse --reps=5`,
        '```',
        ``,
        `Raw per-draw numbers: \`audit-artifacts/renderer-games-bench/results.json\`.`,
        ``,
        `## Caveats`,
        ``,
        `- One board per game, generated from one seed. A game with a different board size or a different`,
        `  mix of text, images and paths will not match these ratios exactly.`,
        `- Generation runs the same code in every row, so \`layout\` is expected to stay flat; the render step`,
        `  is the renderer-only comparison, while \`total\` is what a visitor waits for.`,
        `- Absolute numbers belong to this machine. Re-run before quoting them elsewhere.`,
        `- A row that failed is reported with its error instead of a number; a renderer that throws is a bug,`,
        `  not a slow result.`,
    );

    writeFileSync(reportPath, lines.join("\n") + "\n", "utf8");
    console.log(`\nreport: ${reportPath}`);
    console.log(`raw:    ${join(outDir, "results.json")}`);

    for(const game of GAMES)
    {
        const rows = summary[game];
        const cells = RENDERERS.map((renderer) =>
            rows[renderer].error ? `${renderer}=failed` : `${renderer}=${rows[renderer].medianTotal.toFixed(0)}ms`
        );
        console.log(`  ${game}: ${cells.join(" · ")}`);
    }
};

main().catch((error) =>
{
    console.error("renderer-games-bench: internal error", error);
    process.exit(3);
});
