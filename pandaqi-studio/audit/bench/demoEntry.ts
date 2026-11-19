/* Public demo: does WebGPU actually drive the renderer, and how fast is a frame?
 *
 *   - realtime scene: animated sprites through WebGPUSpriteBatch, or the canvas component drawer
 *   - document scene: a LayoutOperation tree through createRenderer() (the library default)
 *   - capability report: navigator.gpu, the adapter, the reason for a fallback
 *
 * The two backends need two canvases: a canvas element can only ever hand out one context type, so
 * asking a WebGPU canvas for "2d" returns null. Both are stacked and only the active one is shown.
 *
 * Bundled by audit/src/webgpu-demo.ts into audit-artifacts/webgpu-demo and published as a preview.
 */

import { createCanvasDrawer } from "lib/pq-games/draw/canvasDrawer";
import { FULL_PRESET } from "lib/pq-games/draw/presets";
import { WebGPUSpriteBatch, isWebGPUSupported } from "lib/pq-games/draw/webgpu/spriteBatch";
import type { Entity } from "lib/pq-games/draw/entity";
import {
    Circle, LayoutOperation, ResourceGroup, ResourceImage, ResourceShape, Vector2, createRenderer,
} from "lib/pq-games";

const WIDTH = 1280;
const HEIGHT = 720;
const PALETTE = ["#e4572e", "#17bebb", "#ffc914", "#76b041", "#8e6c88", "#2e86ab"];

type Mode = "auto" | "canvas" | "gpu";

const state:any = {
    canvas2d: null as HTMLCanvasElement,
    canvasGpu: null as HTMLCanvasElement,
    ctx: null as CanvasRenderingContext2D,
    drawer: null as any,
    batch: null as WebGPUSpriteBatch|null,
    batchError: null as string|null,
    entities: [] as Entity[],
    mode: "auto" as Mode,
    count: 500,
    running: false,
    fps: 0,
    lastFrameTime: 0,
    backend: "canvas",
};

const $ = (id:string) => document.getElementById(id);

const makeTexture = (index:number, size = 48) =>
{
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const hue = (index * 360) / 8;
    ctx.fillStyle = `hsla(${hue}, 72%, 58%, 0.9)`;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, 60%, 22%, 0.95)`;
    ctx.lineWidth = 3;
    ctx.stroke();
    return canvas;
}

const textures = Array.from({ length: 8 }, (_, i) => makeTexture(i));

const buildEntities = (count:number) : Entity[] =>
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
        const kind = i % 10;

        if(kind === 7 || kind === 8)
        {
            const path = new Path2D();
            if(kind === 7) { path.rect(0, 0, size, size); }
            else { path.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2); }
            entities.push({
                shape: path, fill: PALETTE[i % PALETTE.length], stroke: "#101820", strokeWidth: 2,
                width: size, height: size, anchorX: 0.5, anchorY: 0.5, x, y,
            });
            continue;
        }

        if(kind === 9)
        {
            entities.push({
                text: "HP " + (i % 100), font: "16px system-ui, sans-serif", fill: "#eaf2ff",
                textAlign: "center", textBaseline: "middle", textX: size / 2, textY: size / 2,
                width: size, height: size, anchorX: 0.5, anchorY: 0.5, x, y,
            });
            continue;
        }

        entities.push({ image: textures[i % textures.length], width: size, height: size, anchorX: 0.5, anchorY: 0.5, x, y });
    }
    return entities;
}

const activeBackend = () : "webgpu"|"canvas" =>
{
    if(state.mode === "canvas") { return "canvas"; }
    return state.batch ? "webgpu" : "canvas";
}

const report = () =>
{
    state.backend = activeBackend();

    const gpuLine = $("gpu-status");
    if(gpuLine)
    {
        gpuLine.textContent = state.batch ? "WebGPU batch created and running." : `No WebGPU batch — ${state.batchError ?? "unknown reason"}`;
        gpuLine.className = state.batch ? "ok" : "warn";
    }

    const backendLine = $("backend");
    if(backendLine) { backendLine.textContent = state.backend === "webgpu" ? "WebGPU (instanced)" : "Canvas 2D fallback"; }

    const countLine = $("count-label");
    if(countLine) { countLine.textContent = String(state.count); }

    updateVisibility();
}

const setup = async () =>
{
    state.canvas2d = $("stage-2d") as HTMLCanvasElement;
    state.canvasGpu = $("stage-gpu") as HTMLCanvasElement;
    state.canvas2d.width = WIDTH;
    state.canvas2d.height = HEIGHT;
    state.canvasGpu.width = WIDTH;
    state.canvasGpu.height = HEIGHT;

    state.ctx = state.canvas2d.getContext("2d");
    state.drawer = createCanvasDrawer(state.ctx, FULL_PRESET);
    state.entities = buildEntities(state.count);

    state.batch = await WebGPUSpriteBatch.create(state.canvasGpu, { capacity: 4096 });
    state.batchError = WebGPUSpriteBatch.lastError;

    if(!isWebGPUSupported()) { state.batchError = "navigator.gpu is missing in this browser."; }
    else if(!state.batch) { state.batchError = state.batchError ?? "requestAdapter() returned nothing."; }

    report();
    await describeCapabilities();
    startLoop();
}

const describeCapabilities = async () =>
{
    const gpu:any = (navigator as any).gpu;
    const lines:string[] = [];
    lines.push(`navigator.gpu: ${gpu ? "present" : "missing"}`);
    lines.push(`secure context: ${window.isSecureContext ? "yes" : "no"}`);
    lines.push(`user agent: ${navigator.userAgent}`);

    if(gpu)
    {
        try { lines.push(`preferred canvas format: ${gpu.getPreferredCanvasFormat?.() ?? "?"}`); } catch(error) { lines.push("preferred canvas format: unavailable"); }
        try
        {
            const adapter = await gpu.requestAdapter();
            if(adapter)
            {
                const info = adapter.info ?? {};
                lines.push(`adapter: ${[info.vendor, info.architecture, info.device, info.description].filter(Boolean).join(" · ") || "unnamed"}`);
                const features = Array.from(adapter.features ?? []).slice(0, 12).join(", ");
                lines.push(`adapter features: ${features || "none listed"}`);
            }
            else { lines.push("adapter: requestAdapter() returned null (no usable GPU backend)"); }
        }
        catch(error) { lines.push(`adapter: ${String(error)}`); }
    }
    else
    {
        lines.push("WebGPU needs a browser with navigator.gpu (Chrome/Edge 113+, Safari 26+, Chrome on Android)");
        lines.push("and a GPU backend Chrome can use (D3D12 on Windows, Metal on macOS, Vulkan on Linux).");
    }

    const node = $("capabilities");
    if(node) { node.textContent = lines.join("\n"); }
}

const animate = (time:number) =>
{
    const entities = state.entities;
    for(let i = 0; i < entities.length; i++)
    {
        const entity = entities[i];
        entity.rotation = Math.sin(time * 0.001 + i) * 0.25;
        entity.scaleX = 0.8 + 0.2 * Math.sin(time * 0.002 + i);
        entity.scaleY = entity.scaleX;
    }
}

const drawFrame = () =>
{
    if(state.backend === "webgpu" && state.batch)
    {
        // the GPU path is sprite-only; shapes and text belong to the canvas drawer
        state.batch.begin();
        for(const entity of state.entities) { if(entity.image) { state.batch.add(entity); } }
        state.batch.end(true);
        return;
    }

    state.ctx.setTransform(1, 0, 0, 1, 0, 0);
    state.ctx.clearRect(0, 0, WIDTH, HEIGHT);
    state.drawer.drawAll(state.entities);
}

const updateVisibility = () =>
{
    if(state.canvas2d) { state.canvas2d.style.display = state.backend === "webgpu" ? "none" : "block"; }
    if(state.canvasGpu) { state.canvasGpu.style.display = state.backend === "webgpu" ? "block" : "none"; }
}

const startLoop = () =>
{
    if(state.running) { return; }
    state.running = true;

    let fpsStart = performance.now();
    let fpsFrames = 0;

    const loop = (time:number) =>
    {
        if(!state.running) { return; }
        state.backend = activeBackend();
        updateVisibility();
        animate(time);

        const start = performance.now();
        drawFrame();
        state.lastFrameTime = performance.now() - start;

        fpsFrames++;
        if(time - fpsStart >= 500)
        {
            state.fps = fpsFrames / ((time - fpsStart) / 1000);
            fpsStart = time;
            fpsFrames = 0;

            const fpsNode = $("fps");
            if(fpsNode) { fpsNode.textContent = state.fps.toFixed(0); }
            const frameNode = $("frame-time");
            if(frameNode) { frameNode.textContent = state.lastFrameTime.toFixed(2) + " ms"; }
            const backendNode = $("backend");
            if(backendNode) { backendNode.textContent = state.backend === "webgpu" ? "WebGPU (instanced)" : "Canvas 2D fallback"; }
        }

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

/* Draws a document page once through the library default (createRenderer()). Documents are canvas-only
 * by design, so this reports `canvas`; the GPU controls above are the realtime layer. */
const renderDocument = async () =>
{
    const node = $("document-status");
    if(node) { node.textContent = "drawing…"; }

    const started = performance.now();
    const renderer:any = createRenderer();
    const group = new ResourceGroup();

    for(let i = 0; i < 40; i++)
    {
        const res = new ResourceImage(textures[i % textures.length] as any);
        const op = new LayoutOperation({
            pos: new Vector2(80 + (i % 8) * 140, 120 + Math.floor(i / 8) * 120),
            size: new Vector2(96, 96),
            pivot: Vector2.CENTER,
            alpha: 0.95,
        });
        group.add(res, op);
    }

    for(let i = 0; i < 8; i++)
    {
        const shape = new ResourceShape({ shape: new Circle({ center: new Vector2(0, 0), radius: 42 }) });
        const op = new LayoutOperation({
            pos: new Vector2(160 + i * 130, 600),
            size: new Vector2(84, 84),
            pivot: Vector2.CENTER,
            fill: PALETTE[i % PALETTE.length],
            stroke: "#101820",
            strokeWidth: 3,
        });
        group.add(shape, op);
    }

    try
    {
        const target = document.createElement("canvas");
        target.width = WIDTH;
        target.height = HEIGHT;
        const op = new LayoutOperation({ renderer: renderer, size: new Vector2(WIDTH, HEIGHT), pivot: Vector2.ZERO });
        const canvas = group.toCanvas(target, op);
        const elapsed = performance.now() - started;
        const backend = renderer.lastBackend ?? "canvas";

        const holder = $("document-output");
        if(holder)
        {
            holder.innerHTML = "";
            canvas.style.width = "100%";
            canvas.style.height = "auto";
            canvas.style.display = "block";
            holder.appendChild(canvas);
        }

        if(node)
        {
            node.className = backend === "webgpu" ? "ok" : "warn";
            node.textContent = `${renderer.constructor.name} · backend: ${backend} · ${elapsed.toFixed(0)} ms for one page`;
        }
    }
    catch(error)
    {
        if(node) { node.className = "warn"; node.textContent = "Document render failed: " + String(error); }
    }
}

/* Draws one frame on demand and reads pixels back, so "WebGPU works" can be checked without relying
 * on requestAnimationFrame (which pauses while the window is not visible). */
const probe = async (backend:"webgpu"|"canvas" = "webgpu") =>
{
    try
    {
        const started = performance.now();
        if(backend === "webgpu")
        {
            if(!state.batch) { return { ok: false, backend, error: state.batchError ?? "no batch" }; }
            state.batch.begin();
            for(const entity of state.entities) { if(entity.image) { state.batch.add(entity); } }
            state.batch.end(true);
            await (state.batch as any).device?.queue?.onSubmittedWorkDone?.();
        }
        else
        {
            state.ctx.setTransform(1, 0, 0, 1, 0, 0);
            state.ctx.clearRect(0, 0, WIDTH, HEIGHT);
            state.drawer.drawAll(state.entities);
        }
        const elapsed = performance.now() - started;

        const source = backend === "webgpu" ? state.canvasGpu : state.canvas2d;
        const thumb = document.createElement("canvas");
        thumb.width = 64;
        thumb.height = 36;
        const thumbCtx = thumb.getContext("2d");
        thumbCtx.drawImage(source, 0, 0, thumb.width, thumb.height);
        const data = thumbCtx.getImageData(0, 0, thumb.width, thumb.height).data;

        let opaque = 0;
        for(let i = 3; i < data.length; i += 4) { if(data[i] > 0) { opaque++; } }

        const result = { ok: opaque > 0, backend, opaque, sampled: thumb.width * thumb.height, elapsedMs: Number(elapsed.toFixed(2)) };
        const node = $("probe-status");
        if(node)
        {
            node.className = result.ok ? "ok" : "warn";
            node.textContent = result.ok
                ? `${backend}: drew ${result.opaque} of ${result.sampled} sampled pixels in ${result.elapsedMs} ms`
                : `${backend}: nothing was drawn (${state.batchError ?? "empty canvas"})`;
        }
        return result;
    }
    catch(error)
    {
        const node = $("probe-status");
        if(node) { node.className = "warn"; node.textContent = backend + " probe failed: " + String(error); }
        return { ok: false, backend, error: String(error) };
    }
}

const bindControls = () =>
{
    const slider = $("count") as HTMLInputElement;
    slider?.addEventListener("input", () =>
    {
        state.count = Number(slider.value);
        state.entities = buildEntities(state.count);
        report();
    });

    for(const value of ["auto", "gpu", "canvas"])
    {
        const button = $("mode-" + value);
        button?.addEventListener("click", () =>
        {
            state.mode = value as Mode;
            for(const other of ["auto", "gpu", "canvas"]) { $("mode-" + other)?.classList.toggle("active", other === value); }
            state.backend = activeBackend();
            updateVisibility();
            report();
        });
    }

    $("render-document")?.addEventListener("click", () => { renderDocument(); });
    $("probe-gpu")?.addEventListener("click", () => { probe("webgpu"); });
    $("probe-canvas")?.addEventListener("click", () => { probe("canvas"); });
}

(window as any).pqDemo = { setup, report, renderDocument, probe };

bindControls();
setup().catch((error) => {
    const node = $("gpu-status");
    if(node) { node.className = "warn"; node.textContent = "Setup failed: " + String(error); }
});
