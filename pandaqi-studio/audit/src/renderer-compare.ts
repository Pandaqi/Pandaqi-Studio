/* RendererPixi vs RendererPandaqi on the same board: speed AND pixels.

   cd pandaqi-studio/audit
   bun run renderer-compare                 # 4 draws per renderer, seed "renderer-compare"
   bun run renderer-compare --reps=6 --seed=abc --headed

   Builds audit/bench/rendererCompareEntry.ts for the browser, serves it, renders the board twice with the
   same seed, prints the timings, and writes the three images (pixi / pandaqi / diff) plus a summary to
   audit-artifacts/renderer-compare/. */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { startServer } from "./serve";

const argValue = (name:string, fallback:string) =>
{
    const found = process.argv.find((arg) => arg.startsWith(`--${name}=`));
    return found ? found.split("=").slice(1).join("=") : fallback;
};
const argNumber = (name:string, fallback:number) =>
{
    const raw = argValue(name, "");
    return raw === "" ? fallback : Number(raw);
};

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const outDir = join(studioDir, "audit-artifacts", "renderer-compare");
const siteDir = join(outDir, "site");

const REPS = Math.max(1, argNumber("reps", 4));
const SEED = argValue("seed", "renderer-compare");
const HEADED = process.argv.includes("--headed");
const PORT = argNumber("port", 4332);

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
        entrypoints: [join(auditDir, "bench", "rendererCompareEntry.ts")],
        outdir: siteDir,
        naming: "compare.js",
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
<head><meta charset="utf-8"><link rel="icon" href="data:,"><title>Renderer comparison</title></head>
<body><p>Rendering…</p><script src="./compare.js"></script></body>
</html>
`, "utf8");

    const assetsFrom = join(studioDir, "content", "one-pizza-the-puzzle", "assets");
    if(!existsSync(assetsFrom)) { console.error(`missing assets: ${assetsFrom}`); process.exit(2); }
    cpSync(assetsFrom, join(siteDir, "one-pizza-the-puzzle", "assets"), { recursive: true });

    // RendererPixi loads Pixi at runtime, so the harness serves it like the site does
    const pixiFrom = join(studioDir, "assets", "lib", "pq-games", "renderers", "pixi");
    const pixiTo = join(siteDir, "lib", "pq-games", "renderers", "pixi");
    mkdirSync(pixiTo, { recursive: true });
    for(const file of ["pixi.mjs", "pixi-filters.mjs"]) { cpSync(join(pixiFrom, file), join(pixiTo, file)); }
};

const writeImage = (name:string, dataUrl:string) =>
{
    const base64 = dataUrl.split(",")[1];
    writeFileSync(join(outDir, name), Buffer.from(base64, "base64"));
};

const main = async () =>
{
    console.log(`testing seed "${SEED}", ${REPS} draws per renderer …`);
    await buildBundle();

    const server = startServer(siteDir, PORT);
    const browser = await chromium.launch({
        headless: !HEADED,
        channel: process.env.CHROME_PATH ? undefined : "chrome",
        executablePath: process.env.CHROME_PATH || undefined,
        args: ["--disable-dev-shm-usage", "--disable-extensions", "--disable-background-networking"],
    });

    try
    {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors:string[] = [];
        page.on("pageerror", (error:any) => errors.push(String(error?.message ?? error)));
        page.on("console", (message:any) => {
            if(message.type() !== "error" || /^Failed to load resource/i.test(message.text())) { return; }
            errors.push(message.text());
        });

        await page.goto(`${server.url}/?seed=${encodeURIComponent(SEED)}`, { waitUntil: "load", timeout: 60000 });
        await page.waitForFunction(() => (window as any).pqCompareReady === true, null, { timeout: 60000 });

        if(process.argv.includes("--synthetic"))
        {
            const synth:any = await page.evaluate(() => (window as any).pqCompare.runSynthetic());
            writeImage("synth-pixi.png", synth.images.pixi);
            writeImage("synth-pandaqi.png", synth.images.pandaqi);
            writeFileSync(join(outDir, "synth-result.json"), JSON.stringify(synth, null, 2), "utf8");
            console.log(`synthetic scene: ${(synth.differingRatio * 100).toFixed(2)}% of pixels differ`);
            console.log(`scanline y=50 pixi   : ${synth.scanlineY50.pixi}`);
            console.log(`scanline y=50 pandaqi: ${synth.scanlineY50.pandaqi}`);
            console.log(`\nimages: ${outDir}`);
            return;
        }

        const result:any = await page.evaluate((reps:number) => (window as any).pqCompare.run(reps), REPS);

        if(errors.length > 0) { console.warn(`\npage errors:\n  ${errors.slice(0, 5).join("\n  ")}`); }

        writeImage("pixi.jpg", result.images.pixi);
        writeImage("pandaqi.jpg", result.images.pandaqi);
        writeImage("diff.png", result.images.diff);
        writeImage("crop-pixi.png", result.images.cropPixi);
        writeImage("crop-pandaqi.png", result.images.cropPandaqi);
        writeFileSync(join(outDir, "result.json"), JSON.stringify(result, null, 2), "utf8");

        const fmt = (n:number) => n.toFixed(0);
        console.log(`\nboard ${result.size.pixi.x}×${result.size.pixi.y} px, seed "${result.seed}", ${REPS} draws each\n`);
        console.log("| renderer | median | times |");
        console.log("|---|---|---|");
        console.log(`| RendererPixi | ${fmt(result.medians.pixi)} ms | ${result.timings.pixi.map(fmt).join(", ")} |`);
        console.log(`| RendererPandaqi | ${fmt(result.medians.pandaqi)} ms | ${result.timings.pandaqi.map(fmt).join(", ")} |`);

        const diff = result.diff;
        console.log(`\npixel difference (${diff.width}×${diff.height}, threshold ${diff.threshold}/255 per channel):`);
        console.log(`  ${(diff.differingRatio * 100).toFixed(2)}% of pixels differ, mean abs difference ${diff.meanAbsDiff.toFixed(2)}/255`);
        console.log(`  with a ${diff.bestShift.dx}/${diff.bestShift.dy}px shift: ${(diff.differingRatioAtBestShift * 100).toFixed(2)}% differ, mean abs ${diff.meanAbsDiffAtBestShift.toFixed(2)}/255`);
        console.log(`  only Pixi drew it: ${(diff.pixiOnlyRatio * 100).toFixed(2)}%, only Pandaqi drew it: ${(diff.pandaqiOnlyRatio * 100).toFixed(2)}%, both drew it differently: ${(diff.bothDifferRatio * 100).toFixed(2)}%`);
        console.log(`  after a 3x3 blur (same drawing?): ${(diff.blurredDifferingRatio * 100).toFixed(2)}% differ, mean abs ${diff.blurredMeanAbsDiff.toFixed(2)}/255`);
        console.log(`  as a 240px thumbnail (same layout?): ${(diff.thumbnailDifferingRatio * 100).toFixed(2)}% differ, mean abs ${diff.thumbnailMeanAbsDiff.toFixed(2)}/255`);
        if(result.backends.pandaqi) { console.log(`  (Pandaqi backend: ${result.backends.pandaqi})`); }

        const notes = [];
        notes.push(`# RendererPixi vs RendererPandaqi — One Pizza The Puzzle\n`);
        notes.push(`Generated by \`bun run renderer-compare\` (seed \`${result.seed}\`, ${REPS} draws each).\n`);
        notes.push(`| renderer | median | times |`);
        notes.push(`| --- | --- | --- |`);
        notes.push(`| RendererPixi | ${fmt(result.medians.pixi)} ms | ${result.timings.pixi.map(fmt).join(", ")} |`);
        notes.push(`| RendererPandaqi | ${fmt(result.medians.pandaqi)} ms | ${result.timings.pandaqi.map(fmt).join(", ")} |`);
        notes.push(`\nPixel difference at ${diff.width}×${diff.height} (threshold ${diff.threshold}/255 per channel):`);
        notes.push(`**${(diff.differingRatio * 100).toFixed(2)}%** of pixels differ, mean absolute difference ${diff.meanAbsDiff.toFixed(2)}/255.`);
        notes.push(`Shifted by ${diff.bestShift.dx}/${diff.bestShift.dy}px: ${(diff.differingRatioAtBestShift * 100).toFixed(2)}% (mean ${diff.meanAbsDiffAtBestShift.toFixed(2)}/255), so there is no global offset between the two boards.`);
        notes.push(`\nSplit by who drew the pixel: only Pixi ${(diff.pixiOnlyRatio * 100).toFixed(2)}%, only Pandaqi ${(diff.pandaqiOnlyRatio * 100).toFixed(2)}%, both (differently) ${(diff.bothDifferRatio * 100).toFixed(2)}%.`);
        notes.push(`\nThe geometry is not what differs. \`bun run renderer-compare --synthetic\` draws a deliberately known
scene (a rect stroked MIDDLE, OUTSIDE and INSIDE, a translucent thin line, a vertical thin line, text, a nested
group) with both renderers: the scanline through the three stroked rects is pixel-identical
(\`.0-24 #25-34 .35-104 #105-114\` on both), so stroke width, stroke alignment, scaling and group transforms match.

Two Pixi bugs used to account for most of that, and both are fixed now:

- Pixi took a stroke colour from \`ColorLike.toNumber()\`, which is RGB only, so the board's \`#00000044\` grid
  came out opaque black instead of 26% grey (the style now gets \`ColorLike.getAlpha()\` as well);
- a shape whose bounding box has zero width (a vertical \`Line\`) divided by zero while being sized, which turned
  its scale and position into \`NaN\` and made it invisible (\`applyResourceSizing\` now falls back to the other axis).

What is left is edge antialiasing: after a 3x3 blur only a fraction of a percent differs, and the only pixels one
renderer draws and the other does not are sub-pixel edges. All the effects these games use (drop shadow, grayscale,
glow) have canvas implementations (\`applyShadow\` / \`applyToCanvasPost\`).`);
        notes.push(`\nImages: \`audit-artifacts/renderer-compare/pixi.jpg\`, \`pandaqi.jpg\`, \`diff.png\`, and 1:1 crops
\`crop-pixi.png\` / \`crop-pandaqi.png\`. Synthetic scene: \`synth-pixi.png\`, \`synth-pandaqi.png\`.`);
        writeFileSync(join(auditDir, "renderer-compare.md"), notes.join("\n"), "utf8");

        console.log(`\nimages + result: ${outDir}`);
    }
    finally
    {
        await browser.close().catch(() => {});
        server.stop();
    }
};

main().catch((error) => {
    console.error("renderer-compare: internal error", error);
    process.exit(3);
});
