/* Browser entry for the realtime frame benchmark.
 *
 * Builds a typical game frame twice: as plain entity components (the new `draw/` layer) and as the
 * document pipeline's LayoutOperation tree (what RendererPandaqi draws today). Every frame animates
 * the scene and then draws it, including a 1x1 readback so a GPU-backed surface cannot report a
 * frame it has not finished.
 *
 * Drive it from audit/src/frame-bench.ts. Modes:
 *   components       FULL_PRESET drawer (sprites, shapes, text)
 *   components-sprites  SPRITE_PRESET drawer only
 *   layout           RendererPandaqi + LayoutOperation tree
 *   default          createRenderer() + LayoutOperation tree (what a game gets by default)
 *   webgpu           WebGPUSpriteBatch (null when this machine has no WebGPU)
 */

import { createCanvas } from "lib/pq-games/layout/canvas/creators";
import { createCanvasDrawer } from "lib/pq-games/draw/canvasDrawer";
import { FULL_PRESET, SPRITE_PRESET } from "lib/pq-games/draw/presets";
import { WebGPUSpriteBatch } from "lib/pq-games/draw/webgpu/spriteBatch";
import type { Entity } from "lib/pq-games/draw/entity";

import {
    Circle, LayoutOperation, Rectangle, RendererPandaqi, ResourceGroup, ResourceImage, ResourceShape,
    Vector2, createRenderer,
} from "lib/pq-games";

const WIDTH = 1280;
const HEIGHT = 720;
const TEXTURES = 8;

// plain hex: the LayoutOperation path parses colours as hex, and canvas accepts it too
const PALETTE = ["#e4572e", "#17bebb", "#ffc914", "#76b041", "#8e6c88", "#2e86ab"];

type Mode = "components" | "components-sprites" | "layout" | "default" | "webgpu" | "idle";

interface BenchOptions
{
    count?: number
    frames?: number
    warmup?: number
    mode?: Mode
    /** Rotate every entity each frame; off isolates blit-only cost. */
    spin?: boolean
}

const state:any = {
    canvas: null as HTMLCanvasElement,
    ctx: null as CanvasRenderingContext2D,
    probe: null as HTMLCanvasElement,
    probeCtx: null as CanvasRenderingContext2D,
    textures: [] as HTMLCanvasElement[],
    entities: [] as Entity[],
    drawer: null as any,
    layoutGroup: null as ResourceGroup,
    layoutRoot: null as LayoutOperation,
    layoutMoves: [] as { op:LayoutOperation, x:number, y:number, rotation:number }[],
    batch: null as WebGPUSpriteBatch|null,
    batchError: null as string|null,
    spin: true,
};

const makeTexture = (index:number, size = 48) =>
{
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const hue = (index * 360) / TEXTURES;
    ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.85)`;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, 60%, 25%, 0.9)`;
    ctx.lineWidth = 3;
    ctx.stroke();
    return canvas;
}

const makeEntities = (count:number, mixed:boolean) : Entity[] =>
{
    const entities:Entity[] = [];
    const size = 48;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const gapX = WIDTH / cols;
    const gapY = HEIGHT / rows;

    for(let i = 0; i < count; i++)
    {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = gapX * (col + 0.5);
        const y = gapY * (row + 0.5);
        const kind = mixed ? i % 10 : 0;

        if(kind >= 7 && kind <= 8)
        {
            // a shape entity: one Path2D built once, reused every frame
            const path = new Path2D();
            if(kind === 7) { path.rect(0, 0, size, size); }
            else { path.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2); }
            entities.push({
                shape: path, fill: PALETTE[i % PALETTE.length],
                stroke: "#101820", strokeWidth: 2, strokeAlign: "middle",
                width: size, height: size, anchorX: 0.5, anchorY: 0.5,
                x, y, rotation: 0, scaleX: 1, scaleY: 1,
            });
            continue;
        }

        if(kind === 9)
        {
            entities.push({
                text: "HP " + (i % 100), font: "16px sans-serif", fill: "#ffffff",
                textAlign: "center", textBaseline: "middle", textX: size / 2, textY: size / 2,
                width: size, height: size, anchorX: 0.5, anchorY: 0.5,
                x, y, rotation: 0, scaleX: 1, scaleY: 1,
            });
            continue;
        }

        entities.push({
            image: state.textures[i % TEXTURES],
            width: size, height: size, anchorX: 0.5, anchorY: 0.5,
            x, y, rotation: 0, scaleX: 1, scaleY: 1,
            alpha: 1,
        });
    }
    return entities;
}

const buildLayoutScene = (entities:Entity[]) =>
{
    const group = new ResourceGroup();
    const moves:{ op:LayoutOperation, x:number, y:number, rotation:number }[] = [];

    for(const entity of entities)
    {
        let resource:any = null;
        if(entity.image) { resource = new ResourceImage(entity.image as HTMLCanvasElement); }
        else if(entity.shape) { resource = new ResourceShape({ shape: new Rectangle().fromTopLeft(new Vector2(0, 0), new Vector2(entity.width, entity.height)) }); }
        else { continue; } // the layout pipeline is measured on what it can draw cheaply

        const op = new LayoutOperation({
            pos: new Vector2(entity.x, entity.y),
            size: new Vector2(entity.width, entity.height),
            pivot: Vector2.CENTER,
            fill: entity.fill ?? null,
            stroke: entity.stroke ?? null,
            strokeWidth: entity.strokeWidth ?? 0,
        });
        group.add(resource, op);
        moves.push({ op: op, x: entity.x, y: entity.y, rotation: entity.rotation ?? 0 });
    }

    return {
        group: group,
        root: new LayoutOperation({ renderer: null }),
        moves: moves,
    };
}

const prepare = async (options:BenchOptions = {}) =>
{
    const count = options.count ?? 500;
    const mixed = (options.mode ?? "components") === "components";

    state.canvas = createCanvas({ width: WIDTH, height: HEIGHT });
    // An offscreen canvas that nothing presents never has to rasterize, so it cannot answer "does this
    // run at 60 FPS". Present the real canvas in the real page instead.
    state.canvas.style.width = WIDTH + "px";
    state.canvas.style.height = HEIGHT + "px";
    state.canvas.style.display = "block";
    if(state.canvas.parentNode !== document.body) { document.body.appendChild(state.canvas); }
    state.ctx = state.canvas.getContext("2d");
    // the canvas that forces the rasterizer to finish before the timer stops
    state.probe = document.createElement("canvas");
    state.probe.width = 1;
    state.probe.height = 1;
    state.probeCtx = state.probe.getContext("2d");

    state.textures = [];
    for(let i = 0; i < TEXTURES; i++) { state.textures.push(makeTexture(i)); }

    state.spin = options.spin !== false;
    state.entities = makeEntities(count, mixed);

    // the LayoutOperation scene is only built for the modes that draw it
    if(options.mode === "layout" || options.mode === "default")
    {
        const layoutScene = buildLayoutScene(state.entities);
        state.layoutGroup = layoutScene.group;
        state.layoutMoves = layoutScene.moves;
        state.layoutRoot = layoutScene.root;
    }

    if(options.mode === "components" || options.mode === "components-sprites")
    {
        state.drawer = createCanvasDrawer(state.ctx, options.mode === "components" ? FULL_PRESET : SPRITE_PRESET);
    }

    if(options.mode === "layout")
    {
        state.layoutRoot.renderer = new RendererPandaqi();
    }

    if(options.mode === "default")
    {
        state.layoutRoot.renderer = createRenderer();
    }

    if(options.mode === "webgpu")
    {
        state.batch = await WebGPUSpriteBatch.create(state.canvas, { capacity: count + 16 });
        state.batchError = WebGPUSpriteBatch.lastError;
    }

    return {
        mode: options.mode ?? "components",
        spin: state.spin,
        count: state.entities.length,
        textures: TEXTURES,
        canvas: { width: WIDTH, height: HEIGHT },
        webgpu: !!(navigator as any).gpu,
        adapter: await describeAdapter(),
        renderer: (state.layoutRoot?.renderer as any)?.constructor?.name ?? null,
        batchError: state.batchError,
    };
}

const describeAdapter = async () =>
{
    const gpu = (navigator as any).gpu;
    if(!gpu) { return null; }
    try
    {
        const adapter = await gpu.requestAdapter();
        if(!adapter) { return null; }
        const info = adapter.info ?? {};
        return { vendor: info.vendor ?? null, architecture: info.architecture ?? null, device: info.device ?? null, description: info.description ?? null };
    }
    catch(error) { return null; }
}

const animate = (time:number) =>
{
    const entities = state.entities;
    for(let i = 0; i < entities.length; i++)
    {
        const entity = entities[i];
        if(state.spin) { entity.rotation = Math.sin(time * 0.001 + i) * 0.2; }
    }

    const moves = state.layoutMoves;
    for(let i = 0; i < moves.length; i++)
    {
        const move = moves[i];
        move.op.pos.y = move.y + Math.sin(time * 0.002 + i) * 8;
        if(state.spin && move.op.resource && (move.op.resource as any).shape) { move.op.rot = Math.sin(time * 0.001 + i) * 0.2; }
    }
}

const flush = async (mode:Mode) =>
{
    if(mode === "webgpu" && state.batch) { await state.batch.device?.queue?.onSubmittedWorkDone?.().catch(() => {}); return; }
    state.probeCtx.drawImage(state.canvas, 0, 0, 1, 1);
    state.probeCtx.getImageData(0, 0, 1, 1);
}

const drawFrame = (mode:Mode) =>
{
    if(mode === "idle") { return; }

    if(mode === "components" || mode === "components-sprites")
    {
        state.drawer.drawAll(state.entities);
    }
    else if(mode === "webgpu")
    {
        if(!state.batch) { throw new Error(state.batchError ?? "WebGPU unavailable"); }
        state.batch.begin();
        for(const entity of state.entities) { state.batch.add(entity); }
        state.batch.end(true);
    }
    else
    {
        state.layoutGroup.toCanvas(state.canvas, state.layoutRoot);
    }
}

/* Two numbers per frame:
 *
 *   dispatch — the time the game's own loop spends issuing draws
 *   frame    — total wall time of the whole run / frames, so every rasterization (including a GPU
 *              queue that would otherwise still be draining) is paid for
 *
 * Flushing after every frame would add a CPU stall a real game never pays; flushing once at the end
 * costs nothing per frame and still makes the run finish its work before the timer stops.
 */
const run = async (options:BenchOptions = {}) =>
{
    const mode = options.mode ?? "components";
    const frames = options.frames ?? 60;
    const warmup = options.warmup ?? 8;
    state.spin = options.spin !== false;

    if(mode === "webgpu" && !state.batch) { return { mode, skipped: state.batchError ?? "WebGPU unavailable", dispatch: [], total: 0, perFrame: 0, frames: 0 }; }

    for(let i = 0; i < warmup; i++) { animate(i * 8); drawFrame(mode); }
    await flush(mode);

    const dispatch:number[] = [];
    const start = performance.now();
    for(let i = 0; i < frames; i++)
    {
        animate((i + warmup) * 16.6);
        const frameStart = performance.now();
        drawFrame(mode);
        dispatch.push(performance.now() - frameStart);
    }
    await flush(mode);
    const total = performance.now() - start;

    return {
        mode,
        count: state.entities.length,
        dispatch,
        total,
        perFrame: total / frames,
        frames,
        webgpu: !!(navigator as any).gpu,
    };
}

/* The honest 60 FPS test: draw inside requestAnimationFrame and count what the browser actually
 * presents. If a frame overruns the budget the compositor skips a present and the count drops, which
 * is exactly the stutter a player sees. The canvas is in the page, so rasterization must happen. */
const runLive = (options:BenchOptions = {}) : Promise<any> =>
{
    const mode = options.mode ?? "components";
    const durationMs = options.frames && options.frames > 100 ? options.frames : 1500;
    state.spin = options.spin !== false;

    if(mode === "webgpu" && !state.batch) { return Promise.resolve({ mode, skipped: state.batchError ?? "WebGPU unavailable", fps: 0, frames: 0 }); }

    return new Promise((resolve) =>
    {
        let frames = 0;
        let start = 0;
        const dispatch:number[] = [];

        const loop = (time:number) =>
        {
            if(start === 0) { start = time; }
            animate(time);

            const frameStart = performance.now();
            drawFrame(mode);
            dispatch.push(performance.now() - frameStart);

            frames++;
            const elapsed = time - start;
            if(elapsed >= durationMs)
            {
                resolve({
                    mode, count: state.entities.length,
                    fps: frames / (elapsed / 1000),
                    frames, elapsed,
                    dispatchMedian: medianOf(dispatch),
                    dispatchP95: percentileOf(dispatch, 0.95),
                    webgpu: !!(navigator as any).gpu,
                });
                return;
            }
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    });
}

const medianOf = (values:number[]) =>
{
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length === 0 ? 0 : (sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]);
}

const percentileOf = (values:number[], fraction:number) =>
{
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

(window as any).pqFrameBench = { prepare, run, runLive };
