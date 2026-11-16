/* Browser entry for the RendererPandaqi vs RendererPixi benchmark.

   It drives the real One Pizza The Puzzle board: the same picker, settings,
   resources and material visualizer the "board" generator page uses, with the
   renderer chosen by `?renderer=pixi|pandaqi`. The seed is shared, so both
   renderers generate and draw the exact same board; the only difference in the
   measured time is the renderer itself.

   Measurement is split in two:
     total   — BoardGeneration.draw(): generate the map + draw it to a canvas
     render  — the part inside MaterialVisualizer.finishDraw(), i.e. building
               the render tree and rasterizing it (this is the renderer)
     layout  — total - render: map generation + laying out the operations

   Kept out of the site bundle: this file is only used by audit/src/renderer-bench.ts. */

import {
    MaterialVisualizer, RendererPandaqi, RendererPixi, ResourceLoader,
    addConfigFromLocalStorage, createGridMapperFromConfig, ensureConfigProperties, setSeed,
} from "lib/pq-games";
import { CONFIG } from "../../assets/games/one-pizza-the-puzzle/shared/config";
import { boardPicker } from "../../assets/games/one-pizza-the-puzzle/board/boardPicker";

const params = new URLSearchParams(location.search);
const rendererName = params.get("renderer") === "pixi" ? "pixi" : "pandaqi";
const seed = params.get("seed") || "renderer-bench";

// TimedVisualizer records how long the renderer's own finishDraw took, without
// touching the library: the game only ever talks to the visualizer.
class TimedVisualizer extends MaterialVisualizer
{
    renderMs = 0;

    async finishDraw(group:any)
    {
        const start = performance.now();
        const canvas = await super.finishDraw(group);

        // Force the pixels through: a GPU-backed canvas (Pixi) queues its work, so without this
        // readback the timer would stop before the board had actually been rasterized. It also makes
        // both renderers pay the same "the canvas is ready to use" cost.
        const probe = document.createElement("canvas");
        probe.width = 1;
        probe.height = 1;
        const probeCtx = probe.getContext("2d");
        probeCtx.drawImage(canvas, 0, 0, 1, 1);
        probeCtx.getImageData(0, 0, 1, 1);

        this.renderMs += performance.now() - start;
        return canvas;
    }
}

const makeRenderer = () => rendererName === "pixi" ? new RendererPixi() : new RendererPandaqi();

const prepare = async () =>
{
    const renderer = makeRenderer();
    CONFIG._game.renderer = renderer;

    addConfigFromLocalStorage(CONFIG);
    ensureConfigProperties(CONFIG);
    CONFIG._settings.defaults.seed.value = seed;
    setSeed(seed);

    const loader = new ResourceLoader({ base: CONFIG._resources.base, renderer });
    loader.setCustomResources((CONFIG._settings.defaults.resources ?? {}).value);
    loader.planLoadMultiple(CONFIG._resources.files ?? {}, CONFIG);
    await loader.loadPlannedResources();
    CONFIG._game.resLoader = loader;

    const mapper = createGridMapperFromConfig(CONFIG, CONFIG._material.board.mapper);
    const size = mapper.getMaxElementSize();

    // fonts have to be usable on the canvas before any text is measured
    try { await (document as any).fonts.ready; } catch (err) { }

    return {
        renderer: rendererName,
        seed,
        itemSize: { x: Math.round(size.x), y: Math.round(size.y) },
        resources: Object.keys(CONFIG._resources.files ?? {}).length,
        backend: backendInfo(),
    };
};

// Which rasterizer the browser is actually offering. Without this, a software
// (SwiftShader) headless run looks like a verdict on the renderers themselves.
const backendInfo = () =>
{
    const info:any = { webgpu: !!(navigator as any).gpu };
    try
    {
        const gl = document.createElement("canvas").getContext("webgl2") as WebGL2RenderingContext | null;
        if(!gl) { info.webgl = "unavailable"; }
        else
        {
            const ext = gl.getExtension("WEBGL_debug_renderer_info");
            info.webgl = ext ? String(gl.getParameter((ext as any).UNMASKED_RENDERER_WEBGL)) : "webgl2 (no debug info)";
        }
    }
    catch (err) { info.webgl = "error"; }
    return info;
};

// Downscaled ink check: proves a renderer actually produced a board (and that
// both produced a comparable amount of drawing) without keeping page canvases.
const inkRatio = (canvas:HTMLCanvasElement) =>
{
    const thumb = document.createElement("canvas");
    thumb.width = 32;
    thumb.height = 32;
    const ctx = thumb.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 32, 32);
    ctx.drawImage(canvas, 0, 0, 32, 32);

    const data = ctx.getImageData(0, 0, 32, 32).data;
    let ink = 0;
    for(let i = 0; i < data.length; i += 4)
    {
        if(data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) { ink++; }
    }
    return ink / (32 * 32);
};

const run = async (reps:number) =>
{
    const mapper = createGridMapperFromConfig(CONFIG, CONFIG._material.board.mapper);
    const size = mapper.getMaxElementSize();

    // one discarded warm-up: font glyphs, texture uploads and JIT all settle here
    await boardPicker().draw(new TimedVisualizer(CONFIG, size));

    const runs = [];
    for(let i = 0; i < reps; i++)
    {
        const visualizer = new TimedVisualizer(CONFIG, size);
        const item = boardPicker();

        const start = performance.now();
        const canvas = await item.draw(visualizer);
        const total = performance.now() - start;

        runs.push({
            total,
            render: visualizer.renderMs,
            layout: total - visualizer.renderMs,
            width: canvas.width,
            height: canvas.height,
            ink: inkRatio(canvas),
        });
    }

    const pixiType = (CONFIG._game.renderer as any)?.rendererInstance?.type ?? null;
    return { renderer: rendererName, seed, runs, pixiType, backend: backendInfo() };
};

(window as any).pqRendererBench = { prepare, run };
(window as any).pqRendererBenchInfo = null;
prepare()
    .then((info) => { (window as any).pqRendererBenchInfo = info; })
    .catch((error) => { (window as any).pqRendererBenchInfo = { error: String(error?.stack || error) }; });
