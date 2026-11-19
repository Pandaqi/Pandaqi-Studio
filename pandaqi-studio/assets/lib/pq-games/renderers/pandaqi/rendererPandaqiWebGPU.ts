import { Vector2 } from "../../geometry/vector2";
import { createCanvas } from "../../layout/canvas/creators";
import { LayoutOperation } from "../../layout/layoutOperation";
import { orderCombosForDrawing } from "../../layout/resources/drawOrder";
import type { LayoutCombo, ResourceGroup } from "../../layout/resources/resourceGroup";
import type { Resource } from "../../layout/resources/resource";
import type { ResourceImage } from "../../layout/resources/resourceImage";
import type { ResourceShape } from "../../layout/resources/resourceShape";
import { drawTextToCanvas } from "../../layout/text/drawing";
import type { RendererDrawFinishParams } from "../renderer";
import { RendererPandaqi } from "./rendererPandaqi";

/* A WebGPU backend for the Pandaqi renderer.

   It is a *texture-cached display list*: every element is rasterized once into its own small canvas
   (text at its text box, an image at its size, a shape at its bounding box) and then composited as a
   quad on the GPU, in draw order, with the element's full transform. Elements that share a texture
   (the same cached image) cost one draw call and no rasterization.

   Anything the GPU path cannot reproduce exactly -- effects, masks, clips, tint, strokes, a group that
   composites as a unit -- is rasterized by the canvas renderer instead and composited as a single
   full-size quad, so the output stays correct. Those elements are exactly as fast as they are on the
   canvas backend; the speed-up is in the plain images, shapes and text that make up most of a page.

   Opt-in only: `createRenderer()` returns the canvas renderer, and the realtime layer prefers this one
   through `draw/spriteRenderer`. Ask for it directly with `createRenderer({ force: "webgpu" })` or
   `new RendererPandaqiWebGPU()`. `isSupported()` reports whether this browser can run it at all.

   The GPU types are declared as `any` on purpose: TypeScript's DOM library only ships WebGPU typings in
   recent versions, and a missing `GPUDevice` name would fail the build on an older lib.
*/

const GPU = globalThis as any;

const WGSL = /* wgsl */ `
struct Params {
    transform: vec4<f32>,     // a, b, c, d
    offset: vec2<f32>,        // e, f
    destinationSize: vec2<f32>,
    canvasSize: vec2<f32>,
    alpha: f32,
    _padding: f32,
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var source: texture_2d<f32>;
@group(0) @binding(2) var sourceSampler: sampler;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VSOutput
{
    var corners = array<vec2<f32>, 6>(
        vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 0.0), vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 1.0), vec2<f32>(0.0, 1.0),
    );

    let corner = corners[index];
    let local = corner * params.destinationSize;
    let world = vec2<f32>(
        params.transform.x * local.x + params.transform.z * local.y + params.offset.x,
        params.transform.y * local.x + params.transform.w * local.y + params.offset.y,
    );

    var output: VSOutput;
    output.position = vec4<f32>(
        world.x / params.canvasSize.x * 2.0 - 1.0,
        1.0 - world.y / params.canvasSize.y * 2.0,
        0.0,
        1.0,
    );
    output.uv = corner;
    return output;
}

@fragment
fn fragmentMain(input: VSOutput) -> @location(0) vec4<f32>
{
    // canvas textures and image bitmaps are premultiplied, so a per-element alpha scales both channels
    let texel = textureSample(source, sourceSampler, input.uv);
    return vec4<f32>(texel.rgb * params.alpha, texel.a * params.alpha);
}
`;

interface WebGPUDrawItem
{
    matrix: number[],        // a, b, c, d, e, f
    width: number,
    height: number,
    source: any,
    alpha: number,
}

interface WebGPURendererParams
{
    // Let the caller share a device between renderers instead of requesting one each time.
    device?: any,
}

const UNIFORM_SIZE = 256; // WebGPU's minimum uniform buffer offset alignment
const UNIFORM_FLOATS = UNIFORM_SIZE / 4;

// The display list uploads a texture per element and rasterizes composited elements at full canvas
// size, which is the wrong trade for a single 300 DPI print page (A4 is 8.7 MP). Above this size the
// canvas renderer is both faster and far lighter on GPU memory; realtime and card-sized work stays on
// the GPU path. Measured in renderer-benchmark.md.
const MAX_GPU_PIXELS = 6_000_000;

export class RendererPandaqiWebGPU extends RendererPandaqi
{
    // What the last finishDraw actually used: "webgpu", or "canvas" when this browser had no usable
    // adapter and the renderer fell back. Useful for "why is my WebGPU render slow" and for benchmarks.
    lastBackend: "webgpu"|"canvas"|null = null;

    private device: any = null;
    private format: string = "bgra8unorm";
    private pipeline: any = null;
    private sampler: any = null;
        private textures = new WeakMap<object, any>();
    private textureList:any[] = [];
    private uniformBuffer:any = null;
    private uniformCapacity = 0;

    constructor(params:WebGPURendererParams = {})
    {
        super();
        this.device = params.device ?? null;
    }

    static isSupported() : boolean
    {
        return typeof navigator !== "undefined" && !!(navigator as any).gpu;
    }

    private async ensureDevice() : Promise<any>
    {
        if(this.device) { return this.device; }
        if(!RendererPandaqiWebGPU.isSupported()) { throw new Error("[RendererPandaqiWebGPU] This browser has no WebGPU support."); }

        const adapter = await (navigator as any).gpu.requestAdapter();
        if(!adapter) { throw new Error("[RendererPandaqiWebGPU] No WebGPU adapter available."); }
        this.device = await adapter.requestDevice();
        return this.device;
    }

    private ensurePipeline(format:string, device:any)
    {
        if(this.pipeline && this.format === format) { return this.pipeline; }
        this.format = format;

        const module = device.createShaderModule({ code: WGSL, label: "pq-renderer-webgpu" });
        this.pipeline = device.createRenderPipeline({
            label: "pq-renderer-webgpu",
            layout: "auto",
            vertex: { module: module, entryPoint: "vertexMain" },
            fragment: {
                module: module,
                entryPoint: "fragmentMain",
                targets: [{
                    format: format,
                    blend: {
                        color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
                        alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
                    },
                }],
            },
            primitive: { topology: "triangle-list" },
        });
        this.sampler = device.createSampler({ magFilter: "linear", minFilter: "linear", addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" });
        return this.pipeline;
    }

    async finishDraw(params:RendererDrawFinishParams)
    {
        // Selecting WebGPU must never break a page: a browser without it (or without a usable adapter)
        // quietly gets the canvas backend instead of an empty document.
        const pixels = (params.size?.x ?? 0) * (params.size?.y ?? 0);
        if(RendererPandaqiWebGPU.isSupported() && pixels <= MAX_GPU_PIXELS)
        {
            try { return await this.finishDrawWebGPU(params); }
            catch(error) { console.warn(`[RendererPandaqiWebGPU] ${String((error as Error)?.message ?? error)} Falling back to canvas.`); }
        }
        this.lastBackend = "canvas";
        return super.finishDraw(params);
    }

    private async finishDrawWebGPU(params:RendererDrawFinishParams)
    {
        const device = await this.ensureDevice();

        const canvas = createCanvas({ size: params.size });
        const context = canvas.getContext("webgpu") as any;
        // a document without WebGPU (or a mocked canvas) has no such context at all
        if(!context || typeof context.configure !== "function") { throw new Error("No WebGPU canvas context available."); }

        const format = (navigator as any).gpu.getPreferredCanvasFormat();
        context.configure({ device: device, format: format, alphaMode: "premultiplied" });
        this.ensurePipeline(format, device);

        const size = params.size;
        const items:WebGPUDrawItem[] = [];
        const rootOp = new LayoutOperation({ renderer: this });
        this.collectItems(params.group, rootOp, items, size);

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: "clear",
                storeOp: "store",
            }],
        });

        pass.setPipeline(this.pipeline);

        // One buffer for every element (each aligned to 256 bytes) instead of one buffer per element:
        // the old path allocated and uploaded a uniform buffer for every quad on the page.
        const uniforms = items.length > 0 ? this.acquireUniformBuffer(device, items.length) : null;
        if(uniforms)
        {
            const data = new Float32Array(items.length * UNIFORM_FLOATS);
            for(let i = 0; i < items.length; i++)
            {
                const item = items[i];
                const offset = i * UNIFORM_FLOATS;
                data[offset + 0] = item.matrix[0]; data[offset + 1] = item.matrix[1];
                data[offset + 2] = item.matrix[2]; data[offset + 3] = item.matrix[3];
                data[offset + 4] = item.matrix[4]; data[offset + 5] = item.matrix[5];
                data[offset + 6] = item.width; data[offset + 7] = item.height;
                data[offset + 8] = size.x; data[offset + 9] = size.y;
                data[offset + 10] = item.alpha; data[offset + 11] = 0;
            }
            device.queue.writeBuffer(uniforms.buffer, 0, data);
        }

        for(let i = 0; i < items.length; i++)
        {
            const item = items[i];
            const bindGroup = device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: uniforms.buffer, offset: i * UNIFORM_SIZE, size: UNIFORM_FLOATS * 4 } },
                    { binding: 1, resource: item.source.createView() },
                    { binding: 2, resource: this.sampler },
                ],
            });

            pass.setBindGroup(0, bindGroup);
            pass.draw(6);
        }

        pass.end();
        device.queue.submit([encoder.finish()]);

        // Makes the pixels real before the caller measures or reads them, exactly like the canvas
        // backend: a submitted GPU command can otherwise complete after the caller moved on.
        try { await device.queue.onSubmittedWorkDone(); } catch(e) {}

        this.lastBackend = "webgpu";
        return canvas;
    }

    private collectItems(resource:Resource, parentOp:LayoutOperation, items:WebGPUDrawItem[], canvasSize:Vector2)
    {
        const op = parentOp;
        op.resource = resource as any;
        op.calculateResultProperties();

        if(op.isGroup())
        {
            const group = resource as ResourceGroup;

            // a group that composites as a unit (alpha, effects, mask, clip, tint) is drawn by the
            // canvas renderer in one go; its children cannot be separated without changing the output
            if(this.groupNeedsCanvas(op))
            {
                items.push(this.rasterizeOperation(op, canvasSize));
                return;
            }

            const combos = orderCombosForDrawing(group.combos, { order: group.order, batching: group.batch });
            for(const combo of combos) { this.collectCombo(combo, op, items, canvasSize); }
            return;
        }

        if(this.operationNeedsCanvas(op))
        {
            items.push(this.rasterizeOperation(op, canvasSize));
            return;
        }

        const item = this.itemForOperation(op);
        if(item) { items.push(item); }
    }

    private collectCombo(combo:LayoutCombo, parentOp:LayoutOperation, items:WebGPUDrawItem[], canvasSize:Vector2)
    {
        const op = combo.operation;
        if(!op) { return; }
        op.parentOperation = parentOp;
        op.renderer = this;
        this.collectItems(combo.resource, op, items, canvasSize);
    }

    private groupNeedsCanvas(op:LayoutOperation) : boolean
    {
        return op.alpha < 1
            || op.composite !== "source-over"
            || op.hasEffects()
            || !!op.hasMask()
            || op.hasClip()
            || op.hasTint()
            || !!op.isDebugEnabled();
    }

    private operationNeedsCanvas(op:LayoutOperation) : boolean
    {
        if(op.isDebugEnabled()) { return true; }
        if(op.hasEffects() || !!op.hasMask() || op.hasClip() || op.hasTint()) { return true; }
        // strokes are tessellated by the canvas rasterizer, not by the quad pipeline
        if(op.hasStroke()) { return true; }
        return false;
    }

    // One element -> one texture + the matrix that places it.
    private itemForOperation(op:LayoutOperation) : WebGPUDrawItem
    {
        const size = op.sizeResult;
        if(size.x <= 0 || size.y <= 0) { return null; }

        const m = op.transformResult.m;

        if(op.isText())
        {
            const canvas = createCanvas({ size: size });
            const ctx = canvas.getContext("2d");
            op.setFillAndStrokeOnContext(ctx);
            drawTextToCanvas(ctx, op, this.debugText);
            return this.itemFromCanvas(canvas, [m[0], m[1], m[2], m[3], m[4], m[5]], size.x, size.y, op.alpha);
        }

        if(op.isImage())
        {
            const resource = op.resource as ResourceImage;
            const drawable = resource.getImageFrame(op.frame ?? 0);
            if(!drawable) { return null; }
            return {
                matrix: [m[0], m[1], m[2], m[3], m[4], m[5]],
                width: size.x, height: size.y,
                source: this.textureFor(drawable as any),
                alpha: op.alpha,
            };
        }

        if(op.isShape())
        {
            const shape = (op.resource as ResourceShape).shape;
            const dims = shape.getDimensions();
            const width = Math.max(1, Math.ceil(dims.size.x));
            const height = Math.max(1, Math.ceil(dims.size.y));

            const canvas = createCanvas({ width: width, height: height });
            const ctx = canvas.getContext("2d");
            op.setFillAndStrokeOnContext(ctx);
            ctx.translate(-dims.position.x, -dims.position.y);
            const path = shape.toPath2D();
            op.applyFillAndStrokeToPath(ctx, path);

            // the path is rasterized in its own box, so the quad has to start where that box starts
            const dx = dims.position.x;
            const dy = dims.position.y;
            const matrix = [
                m[0], m[1], m[2], m[3],
                m[0] * dx + m[2] * dy + m[4],
                m[1] * dx + m[3] * dy + m[5],
            ];
            return this.itemFromCanvas(canvas, matrix, width, height, op.alpha);
        }

        return null;
    }

    private itemFromCanvas(canvas:HTMLCanvasElement, matrix:number[], width:number, height:number, alpha:number) : WebGPUDrawItem
    {
        return { matrix: matrix, width: width, height: height, source: this.textureFor(canvas), alpha: alpha };
    }

    // Anything the quad pipeline cannot express exactly is drawn, in place, by the canvas renderer:
    // the operation already carries its full absolute transform, so this lands in the right spot.
    private rasterizeOperation(op:LayoutOperation, canvasSize:Vector2) : WebGPUDrawItem
    {
        const canvas = createCanvas({ size: canvasSize });
        super.applyOperationToCanvas(op, canvas);
        return this.itemFromCanvas(canvas, [1, 0, 0, 1, 0, 0], canvasSize.x, canvasSize.y, 1);
    }

    // Grows by doubling; a renderer that draws a thousand-element page reuses one buffer afterwards.
    private acquireUniformBuffer(device:any, count:number)
    {
        if(this.uniformBuffer && this.uniformCapacity >= count) { return { buffer: this.uniformBuffer, capacity: this.uniformCapacity }; }

        let capacity = Math.max(16, this.uniformCapacity || 16);
        while(capacity < count) { capacity *= 2; }

        if(this.uniformBuffer) { this.uniformBuffer.destroy(); }
        this.uniformBuffer = device.createBuffer({
            label: "pq-renderer-webgpu-uniforms",
            size: capacity * UNIFORM_SIZE,
            usage: GPU.GPUBufferUsage.UNIFORM | GPU.GPUBufferUsage.COPY_DST,
        });
        this.uniformCapacity = capacity;
        return { buffer: this.uniformBuffer, capacity: capacity };
    }

    private textureFor(source:any) : any
    {
        const cached = this.textures.get(source);
        if(cached) { return cached; }

        const device = this.device;
        const width = Math.max(1, source.naturalWidth ?? source.width);
        const height = Math.max(1, source.naturalHeight ?? source.height);

        const texture = device.createTexture({
            size: [width, height],
            format: "rgba8unorm",
            usage: GPU.GPUTextureUsage.TEXTURE_BINDING | GPU.GPUTextureUsage.COPY_DST | GPU.GPUTextureUsage.RENDER_ATTACHMENT,
        });

        try {
            device.queue.copyExternalImageToTexture({ source: source }, { texture: texture }, [width, height]);
        } catch(e) {
            // a texture that failed to upload must not stay in the cache, or every later draw is blank
            texture.destroy();
            throw e;
        }

        this.textures.set(source, texture);
        this.textureList.push(texture);
        return texture;
    }

    // Frees the GPU textures this renderer uploaded (the browser does not do that on its own while the
    // page lives). Call it between documents if you generate a lot of them.
    destroyTextures()
    {
        for(const texture of this.textureList) { texture.destroy(); }
        this.textureList = [];
        this.textures = new WeakMap<object, any>();
        if(this.uniformBuffer) { this.uniformBuffer.destroy(); this.uniformBuffer = null; this.uniformCapacity = 0; }
    }
}
