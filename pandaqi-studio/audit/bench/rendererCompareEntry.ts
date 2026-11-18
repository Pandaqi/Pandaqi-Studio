/* Browser entry for the RendererPixi vs RendererPandaqi comparison.

   Draws the same board (same seed, same resources, same settings) with both renderers in the same page,
   times both, and diffs the resulting pixels. Used by audit/src/renderer-compare.ts. */

import {
    LayoutOperation, Line, MaterialVisualizer, Rectangle, RendererPandaqi, ResourceGroup,
    ResourceLoader, ResourceShape, ResourceText, StrokeAlign, TextConfig, Vector2,
    createGridMapperFromConfig, ensureConfigProperties, setSeed,
} from "lib/pq-games";
// not part of the barrel any more: nothing on the site uses it, only this comparison does
import { RendererPixi } from "lib/pq-games/renderers/pixi/rendererPixi";
import { CONFIG } from "../../assets/games/one-pizza-the-puzzle/shared/config";
import { boardPicker } from "../../assets/games/one-pizza-the-puzzle/board/boardPicker";

const params = new URLSearchParams(location.search);
const seed = params.get("seed") || "renderer-compare";

const median = (values:number[]) =>
{
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const prepareRenderer = async (name:string) =>
{
    const renderer = name === "pixi" ? new RendererPixi() : new RendererPandaqi();
    CONFIG._game.renderer = renderer as any;
    ensureConfigProperties(CONFIG);
    CONFIG._settings.defaults.seed.value = seed;

    const loader = new ResourceLoader({ base: CONFIG._resources.base, renderer });
    loader.setCustomResources((CONFIG._settings.defaults.resources ?? {}).value);
    loader.planLoadMultiple(CONFIG._resources.files ?? {}, CONFIG);
    await loader.loadPlannedResources();
    CONFIG._game.resLoader = loader;

    const mapper = createGridMapperFromConfig(CONFIG, CONFIG._material.board.mapper);
    const size = mapper.getMaxElementSize();
    try { await (document as any).fonts.ready; } catch(e) {}

    return { renderer, size };
};

const drawBoard = async (renderer:any, size:any) =>
{
    // the seed is reset for every draw so both renderers render the exact same board
    setSeed(seed);
    const start = performance.now();
    const visualizer = new MaterialVisualizer(CONFIG, size);
    const canvas = await boardPicker().draw(visualizer);

    // A canvas can queue its work: without touching the pixels, the timer would stop before the board
    // has actually been rasterized (and GPU-backed renderers would look ~5x faster than they are).
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const probeCtx = probe.getContext("2d", { willReadFrequently: true });
    probeCtx.drawImage(canvas, 0, 0, 1, 1);
    probeCtx.getImageData(0, 0, 1, 1);

    return { canvas, ms: performance.now() - start };
};

const toImageData = (canvas:HTMLCanvasElement, width:number) =>
{
    const height = Math.round(width * canvas.height / canvas.width);
    const scaled = document.createElement("canvas");
    scaled.width = width;
    scaled.height = height;
    const ctx = scaled.getContext("2d", { willReadFrequently: true });
    // both boards are drawn on transparency; white is what a PDF page looks like
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(canvas, 0, 0, width, height);
    return { data: ctx.getImageData(0, 0, width, height), canvas: scaled, width: width, height: height };
};

const preview = (canvas:HTMLCanvasElement) => canvas.toDataURL("image/jpeg", 0.82);

// A 1:1 crop of the same region from both boards: at full resolution a real placement/size difference is
// obvious, while pixel-grid snapping shows up as a hairline at the edges.
const crop = (canvas:HTMLCanvasElement, x:number, y:number, width:number, height:number) =>
{
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    return out.toDataURL("image/png");
};

const run = async (reps:number) =>
{
    const sizes:Record<string, any> = {};
    const timings:Record<string, number[]> = {};
    const canvases:Record<string, HTMLCanvasElement> = {};
    const backends:Record<string, any> = {};

    for(const name of ["pixi", "pandaqi"])
    {
        const { renderer, size } = await prepareRenderer(name);
        sizes[name] = { x: size.x, y: size.y };

        await drawBoard(renderer, size); // warm-up: fonts, textures, JIT

        const times = [];
        let canvas = null;
        for(let i = 0; i < reps; i++)
        {
            const drawn = await drawBoard(renderer, size);
            canvas = drawn.canvas;
            times.push(drawn.ms);
        }

        timings[name] = times;
        canvases[name] = canvas;
        backends[name] = (renderer as any).lastBackend ?? null;
    }

    const WIDTH = 1200;
    const a = toImageData(canvases.pixi, WIDTH);
    const b = toImageData(canvases.pandaqi, WIDTH);
    const diffCanvas = document.createElement("canvas");
    diffCanvas.width = a.width;
    diffCanvas.height = a.height;
    const diffCtx = diffCanvas.getContext("2d");
    const diffImage = diffCtx.createImageData(a.width, a.height);

    const THRESHOLD = 16; // per-channel: below this, antialiasing noise nobody can see
    const pixelCount = a.width * a.height;

    // Measures both an exact comparison and the best match when the second image is shifted by a whole
    // pixel or two. That separates "the same drawing, snapped to the pixel grid differently" from "the
    // two renderers place things in different spots".
    const measure = (dx:number, dy:number) =>
    {
        let differing = 0;
        let totalAbs = 0;
        const width = a.width, height = a.height;
        const stride = width * 4;
        for(let y = 0; y < height; y++)
        {
            const sy = y + dy;
            if(sy < 0 || sy >= height) { differing += width; totalAbs += width * 255 * 4; continue; }
            for(let x = 0; x < width; x++)
            {
                const sx = x + dx;
                const i = y * stride + x * 4;
                if(sx < 0 || sx >= width) { differing++; totalAbs += 255 * 4; continue; }
                const j = sy * stride + sx * 4;
                const dr = Math.abs(a.data.data[i] - b.data.data[j]);
                const dg = Math.abs(a.data.data[i + 1] - b.data.data[j + 1]);
                const db = Math.abs(a.data.data[i + 2] - b.data.data[j + 2]);
                const da = Math.abs(a.data.data[i + 3] - b.data.data[j + 3]);
                totalAbs += dr + dg + db + da;
                if(Math.max(dr, dg, db, da) > THRESHOLD) { differing++; }
            }
        }
        return { differingRatio: differing / pixelCount, meanAbsDiff: totalAbs / (pixelCount * 4) };
    };

    // A blurred pass answers a different question than the exact one: "is this the same drawing?" Two
    // rasterizers will always disagree on a one-pixel edge, but a missing, moved or differently sized
    // element survives a blur as a solid patch.
    const blur = (img:ImageData) =>
    {
        const width = img.width, height = img.height;
        const out = new Uint8ClampedArray(img.data.length);
        for(let y = 0; y < height; y++)
        {
            for(let x = 0; x < width; x++)
            {
                for(let c = 0; c < 4; c++)
                {
                    let sum = 0, count = 0;
                    for(let dy = -1; dy <= 1; dy++)
                    {
                        const sy = y + dy;
                        if(sy < 0 || sy >= height) { continue; }
                        for(let dx = -1; dx <= 1; dx++)
                        {
                            const sx = x + dx;
                            if(sx < 0 || sx >= width) { continue; }
                            sum += img.data[(sy * width + sx) * 4 + c];
                            count++;
                        }
                    }
                    out[(y * width + x) * 4 + c] = sum / count;
                }
            }
        }
        return { data: out, width: width, height: height } as ImageData;
    };

    const diffOf = (imgA:ImageData, imgB:ImageData, threshold:number) =>
    {
        let differing = 0, totalAbs = 0;
        const count = imgA.width * imgA.height;
        for(let i = 0; i < imgA.data.length; i++)
        {
            const d = Math.abs(imgA.data[i] - imgB.data[i]);
            totalAbs += d;
            if(d > threshold) { differing++; }
        }
        const channelCount = imgA.data.length;
        return { differingRatio: differing / channelCount, meanAbsDiff: totalAbs / channelCount };
    };

    const blurred = diffOf(blur(a.data), blur(b.data), THRESHOLD);

    // downsample both to a thumbnail: at this size only layout differences can survive
    const thumbnail = (canvas:HTMLCanvasElement, width:number) =>
    {
        const height = Math.round(width * canvas.height / canvas.width);
        const small = document.createElement("canvas");
        small.width = width;
        small.height = height;
        const ctx = small.getContext("2d", { willReadFrequently: true });
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(canvas, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    };
    const thumbDiff = diffOf(thumbnail(canvases.pixi, 240), thumbnail(canvases.pandaqi, 240), 24);

    // Not every difference is "both drew something else": a renderer can drop or add an element. Splitting
    // those apart says whether the two images contain the same drawing.
    const isBlank = (data:Uint8ClampedArray, i:number) => data[i] > 246 && data[i + 1] > 246 && data[i + 2] > 246;
    let pixiOnly = 0, pandaqiOnly = 0, bothDiffer = 0;
    for(let i = 0; i < a.data.data.length; i += 4)
    {
        const pixiBlank = isBlank(a.data.data, i);
        const pandaqiBlank = isBlank(b.data.data, i);
        if(pixiBlank && pandaqiBlank) { continue; }
        const worst = Math.max(
            Math.abs(a.data.data[i] - b.data.data[i]),
            Math.abs(a.data.data[i + 1] - b.data.data[i + 1]),
            Math.abs(a.data.data[i + 2] - b.data.data[i + 2]),
        );
        if(worst <= 16) { continue; }
        if(pixiBlank) { pandaqiOnly++; }
        else if(pandaqiBlank) { pixiOnly++; }
        else { bothDiffer++; }
    }

    const exact = measure(0, 0);
    let best = { dx: 0, dy: 0, ...exact };
    for(const dx of [-2, -1, 1, 2])
    {
        for(const dy of [-2, -1, 0, 1, 2])
        {
            const shifted = measure(dx, dy);
            if(shifted.differingRatio < best.differingRatio) { best = { dx: dx, dy: dy, ...shifted }; }
        }
    }

    // the diff image always shows the exact comparison, so a real difference stays visible
    for(let i = 0; i < a.data.data.length; i += 4)
    {
        const worst = Math.max(
            Math.abs(a.data.data[i] - b.data.data[i]),
            Math.abs(a.data.data[i + 1] - b.data.data[i + 1]),
            Math.abs(a.data.data[i + 2] - b.data.data[i + 2]),
            Math.abs(a.data.data[i + 3] - b.data.data[i + 3]),
        );
        const differs = worst > THRESHOLD;
        diffImage.data[i] = differs ? 255 : 255 - worst * 4;
        diffImage.data[i + 1] = differs ? 0 : 255 - worst * 4;
        diffImage.data[i + 2] = differs ? 255 : 255 - worst * 4;
        diffImage.data[i + 3] = 255;
    }
    diffCtx.putImageData(diffImage, 0, 0);

    return {
        seed,
        size: sizes,
        reps,
        timings,
        medians: { pixi: median(timings.pixi), pandaqi: median(timings.pandaqi) },
        backends,
        diff: {
            width: a.width,
            height: a.height,
            differingRatio: exact.differingRatio,
            meanAbsDiff: exact.meanAbsDiff,
            threshold: THRESHOLD,
            bestShift: { dx: best.dx, dy: best.dy },
            differingRatioAtBestShift: best.differingRatio,
            meanAbsDiffAtBestShift: best.meanAbsDiff,
            pixiOnlyRatio: pixiOnly / pixelCount,
            pandaqiOnlyRatio: pandaqiOnly / pixelCount,
            bothDifferRatio: bothDiffer / pixelCount,
            blurredDifferingRatio: blurred.differingRatio,
            blurredMeanAbsDiff: blurred.meanAbsDiff,
            thumbnailDifferingRatio: thumbDiff.differingRatio,
            thumbnailMeanAbsDiff: thumbDiff.meanAbsDiff,
        },
        images: {
            pixi: preview(a.canvas),
            pandaqi: preview(b.canvas),
            diff: diffCanvas.toDataURL("image/png"),
            cropPixi: crop(canvases.pixi, 0, 40, 700, 460),
            cropPandaqi: crop(canvases.pandaqi, 0, 40, 700, 460),
        },
    };
};

/* A tiny, known scene: the same primitives the games use, at coordinates I can read off the image. It
   isolates renderer semantics from whatever a specific board happens to draw. */
const syntheticScene = () =>
{
    const group = new ResourceGroup();
    const rect = () => new Rectangle().fromTopLeft(new Vector2(), new Vector2(80, 60));

    // three thick strokes with each alignment, side by side
    const stroke = (x:number, align:StrokeAlign) => group.add(new ResourceShape(rect()), new LayoutOperation({
        pos: new Vector2(x, 20), size: new Vector2(80, 60),
        fill: "#99BBFF", stroke: "#000000", strokeWidth: 10, strokeAlign: align,
    }));
    stroke(30, StrokeAlign.MIDDLE);
    stroke(150, StrokeAlign.OUTSIDE);
    stroke(270, StrokeAlign.INSIDE);

    // a thin translucent line, like the board's paper grid
    group.add(new ResourceShape(new Line(new Vector2(20, 120), new Vector2(380, 120))), new LayoutOperation({
        stroke: "#00000044", strokeWidth: 2,
    }));

    // a vertical thin line (zero-width bounding box: the shape-sizing edge case)
    group.add(new ResourceShape(new Line(new Vector2(200, 140), new Vector2(200, 240))), new LayoutOperation({
        stroke: "#000000", strokeWidth: 3,
    }));

    // text
    group.add(new ResourceText({ text: "Hello renderer", textConfig: new TextConfig({ size: 24 }) }), new LayoutOperation({
        pos: new Vector2(20, 150), size: new Vector2(300, 40), fill: "#000000", pivot: Vector2.ZERO,
    }));

    // a nested group with a child that has its own offset
    const inner = new ResourceGroup();
    inner.add(new ResourceShape(rect()), new LayoutOperation({ pos: new Vector2(10, 10), size: new Vector2(40, 30), fill: "#FF9900" }));
    group.add(inner, new LayoutOperation({ pos: new Vector2(20, 250), size: new Vector2(200, 40) }));

    return group;
};

const runSynthetic = async () =>
{
    const size = new Vector2(400, 300);
    const canvases:Record<string, HTMLCanvasElement> = {};

    for(const name of ["pixi", "pandaqi"])
    {
        const renderer = name === "pixi" ? new RendererPixi({ bgColor: "#FFFFFF" }) : new RendererPandaqi();
        const group = syntheticScene();
        canvases[name] = await renderer.finishDraw({ size: size, group: group });
    }

    const toData = (canvas:HTMLCanvasElement, fill:string) =>
    {
        const out = document.createElement("canvas");
        out.width = canvas.width;
        out.height = canvas.height;
        const ctx = out.getContext("2d");
        ctx.fillStyle = fill;
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(canvas, 0, 0);
        return ctx.getImageData(0, 0, out.width, out.height);
    };

    // Pixel-scannable copy without the extra white fill (Pixi already paints its own background).
    const a = toData(canvases.pixi, "#FFFFFF");
    const b = toData(canvases.pandaqi, "#FFFFFF");

    let differing = 0;
    for(let i = 0; i < a.data.length; i += 4)
    {
        if(Math.max(
            Math.abs(a.data[i] - b.data[i]),
            Math.abs(a.data[i + 1] - b.data[i + 1]),
            Math.abs(a.data[i + 2] - b.data[i + 2]),
        ) > 16) { differing++; }
    }

    const png = (canvas:HTMLCanvasElement) => canvas.toDataURL("image/png");
    const toPng = (data:ImageData) =>
    {
        const out = document.createElement("canvas");
        out.width = data.width;
        out.height = data.height;
        out.getContext("2d").putImageData(data, 0, 0);
        return png(out);
    };

    // a scanline through the middle of the three stroked rects: shows stroke width and placement
    const scanline = (data:ImageData, y:number) =>
    {
        const runs:string[] = [];
        let current = "";
        let start = 0;
        const dark = (i:number) => data.data[i] < 100;
        for(let x = 0; x < data.width; x++)
        {
            const state = dark((y * data.width + x) * 4) ? "#" : ".";
            if(state !== current)
            {
                if(current !== "") { runs.push(`${current}${start}-${x - 1}`); }
                current = state;
                start = x;
            }
        }
        runs.push(`${current}${start}-${data.width - 1}`);
        return runs.join(" ");
    };

    return {
        differingRatio: differing / (a.width * a.height),
        images: { pixi: png(canvases.pixi), pandaqi: png(canvases.pandaqi), diff: toPng(a) },
        scanlineY50: { pixi: scanline(a, 50), pandaqi: scanline(b, 50) },
    };
};

(window as any).pqCompare = { run, runSynthetic };
(window as any).pqCompareReady = true;
