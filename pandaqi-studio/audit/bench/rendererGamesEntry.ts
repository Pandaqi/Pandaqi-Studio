/* Browser entry for the multi-game renderer benchmark.

   Drives the real `board` generator of several games through three renderers:

     ?renderer=pixi     RendererPixi, what every game shipped with before the switch
     ?renderer=pandaqi  RendererPandaqi, the current canvas renderer
     ?renderer=legacy   RendererPandaqi as it was before the optimization pass (git 796c539e)

   `legacy` exists only to prove what the optimizations bought; it lives outside the
   library's public entry points and is not imported anywhere else.

   Every renderer gets the same seed, the same resources and the same generator, so
   the difference in the measured time is the renderer itself.

   Measurement is split the same way as rendererBenchEntry.ts:
     total   — item.draw(): generate the board and rasterize it
     render  — the part inside MaterialVisualizer.finishDraw(), i.e. the renderer
     layout  — total - render: generation + laying out the operations */

import {
    MaterialVisualizer, RendererPandaqi, ResourceLoader,
    addConfigFromLocalStorage, createGridMapperFromConfig, ensureConfigProperties, setSeed,
} from "lib/pq-games";
import { RendererPixi } from "lib/pq-games/renderers/pixi/rendererPixi";
import { RendererPandaqi as RendererPandaqiLegacy } from "./legacyRendererPandaqi";

// Games are imported statically: Bun.build cannot resolve a dynamic specifier, and the bench only
// ever ships this one page.
import { CONFIG as onePizzaConfig } from "../../assets/games/one-pizza-the-puzzle/shared/config";
import { boardPicker as onePizzaPicker } from "../../assets/games/one-pizza-the-puzzle/board/boardPicker";

import { CONFIG as starryConfig } from "../../assets/games/starry-skylines/shared/config";
import { boardPicker as starryPicker } from "../../assets/games/starry-skylines/board/boardPicker";

import { CONFIG as mistConfig } from "../../assets/games/the-mist/shared/config";
import { boardPicker as mistPicker } from "../../assets/games/the-mist/board/boardPicker";

import { CONFIG as magnetmenConfig } from "../../assets/games/magnetmen/shared/config";
import { boardPicker as magnetmenPicker } from "../../assets/games/magnetmen/board/boardPicker";

import { CONFIG as unstableConfig } from "../../assets/games/unstable-universe/shared/config";
import { boardPicker as unstablePicker } from "../../assets/games/unstable-universe/board/boardPicker";

import { CONFIG as kangaruseConfig } from "../../assets/games/kangaruse/board/config";
import { boardPicker as kangarusePicker } from "../../assets/games/kangaruse/board/boardPicker";

import { CONFIG as transportsConfig } from "../../assets/games/timely-transports/shared/config";
import { boardPicker as transportsPicker } from "../../assets/games/timely-transports/board/boardPicker";

const GAMES:Record<string, { config:any, picker:() => any }> = {
    "one-pizza-the-puzzle": { config: onePizzaConfig, picker: onePizzaPicker },
    "starry-skylines": { config: starryConfig, picker: starryPicker },
    "the-mist": { config: mistConfig, picker: mistPicker },
    "magnetmen": { config: magnetmenConfig, picker: magnetmenPicker },
    "unstable-universe": { config: unstableConfig, picker: unstablePicker },
    "kangaruse": { config: kangaruseConfig, picker: kangarusePicker },
    "timely-transports": { config: transportsConfig, picker: transportsPicker },
};

const params = new URLSearchParams(location.search);
const rendererName = params.get("renderer") || "pandaqi";
const gameName = params.get("game") || "one-pizza-the-puzzle";
const seed = params.get("seed") || "renderer-games-bench";

const ENTRY = GAMES[gameName];
if(!ENTRY) { throw new Error(`Unknown game "${gameName}" (known: ${Object.keys(GAMES).join(", ")})`); }
const CONFIG = ENTRY.config;

// TimedVisualizer records how long the renderer's own finishDraw took, without touching the library:
// the game only ever talks to the visualizer.
class TimedVisualizer extends MaterialVisualizer
{
    renderMs = 0;

    async finishDraw(group:any)
    {
        const start = performance.now();
        const canvas = await super.finishDraw(group);

        // Force the pixels through: a GPU-backed canvas (Pixi) queues its work, so without this
        // readback the timer would stop before the board had actually been rasterized. It also makes
        // all renderers pay the same "the canvas is ready to use" cost.
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

const makeRenderer = () =>
{
    if(rendererName === "pixi") { return new RendererPixi(); }
    if(rendererName === "legacy") { return new RendererPandaqiLegacy(); }
    return new RendererPandaqi();
};

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

    try { await (document as any).fonts.ready; } catch (err) { }

    return {
        game: gameName,
        renderer: rendererName,
        seed,
        itemSize: { x: Math.round(size.x), y: Math.round(size.y) },
        resources: Object.keys(CONFIG._resources.files ?? {}).length,
        backend: backendInfo(),
    };
};

const run = async (reps:number) =>
{
    const mapper = createGridMapperFromConfig(CONFIG, CONFIG._material.board.mapper);
    const size = mapper.getMaxElementSize();

    // one discarded warm-up: font glyphs, texture uploads and JIT all settle here
    await ENTRY.picker().draw(new TimedVisualizer(CONFIG, size));

    const runs = [];
    for(let i = 0; i < reps; i++)
    {
        const visualizer = new TimedVisualizer(CONFIG, size);
        const item = ENTRY.picker();

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
    return { game: gameName, renderer: rendererName, seed, runs, pixiType, backend: backendInfo() };
};

(window as any).pqRendererGamesBench = { prepare, run };
(window as any).pqRendererGamesBenchInfo = null;
prepare()
    .then((info) => { (window as any).pqRendererGamesBenchInfo = info; })
    .catch((error) => { (window as any).pqRendererGamesBenchInfo = { error: String(error?.stack || error) }; });
