/* WebGPU sprite batch.
 *
 * A texture-cached, instanced quad renderer for realtime scenes. Nothing is rasterized per frame: an
 * entity contributes 16 floats (matrix, size, UV rectangle, colour) to one growing instance buffer,
 * and consecutive entities that share a texture become a single draw call. That is the shape a
 * canvas game actually has, so a few thousand sprites cost one buffer upload and a handful of draws.
 *
 * It is deliberately small: sprites only. Text and arbitrary paths are canvas work (see
 * `draw/presets.ts`); a HUD usually sits on a second canvas above the game canvas anyway.
 *
 * Every GPU type is `any` because the DOM lib in this project predates WebGPU typings.
 */

import { createMatrix, multiplyMatrix, setEntityMatrix, type Matrix2D } from "../matrix";
import { getImageHeight, getImageWidth } from "../measure";
import type { Entity } from "../entity";

const GPU = globalThis as any;

const FLOATS_PER_INSTANCE = 16;
const BYTES_PER_INSTANCE = FLOATS_PER_INSTANCE * 4;

const WGSL = /* wgsl */ `
struct Globals {
    canvasSize: vec2<f32>,
    _pad: vec2<f32>,
};

@group(0) @binding(0) var<uniform> globals: Globals;
@group(0) @binding(1) var texSampler: sampler;

@group(1) @binding(0) var source: texture_2d<f32>;

struct Instance {
    @location(0) abcd: vec4<f32>,
    @location(1) ef: vec2<f32>,
    @location(2) size: vec2<f32>,
    @location(3) uv: vec4<f32>,
    @location(4) color: vec4<f32>,
};

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) color: vec4<f32>,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32, instance: Instance) -> VSOutput
{
    var corners = array<vec2<f32>, 6>(
        vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 0.0), vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 1.0), vec2<f32>(0.0, 1.0),
    );

    let corner = corners[index];
    let local = corner * instance.size;
    let world = vec2<f32>(
        instance.abcd.x * local.x + instance.abcd.z * local.y + instance.ef.x,
        instance.abcd.y * local.x + instance.abcd.w * local.y + instance.ef.y,
    );

    var output: VSOutput;
    output.position = vec4<f32>(
        world.x / globals.canvasSize.x * 2.0 - 1.0,
        1.0 - world.y / globals.canvasSize.y * 2.0,
        0.0,
        1.0,
    );
    output.uv = mix(instance.uv.xy, instance.uv.zw, corner);
    output.color = instance.color;
    return output;
}

@fragment
fn fragmentMain(input: VSOutput) -> @location(0) vec4<f32>
{
    let texel = textureSample(source, texSampler, input.uv);
    return texel * input.color;
}
`;

interface BatchTexture
{
    texture: any
    view: any
    bindGroup: any
    nearest: boolean
    width: number
    height: number
    destroyed: boolean
}

export interface SpriteBatchOptions
{
    device?: any
    /** Nearest-neighbour unless you ask for smooth scaling. */
    smoothing?: boolean
    /** Instances allocated up front; the buffer still grows when a frame needs more. */
    capacity?: number
}

export const isWebGPUSupported = () : boolean =>
{
    return typeof navigator !== "undefined" && !!(navigator as any).gpu;
}

export class WebGPUSpriteBatch
{
    static lastError: string|null = null;

    readonly canvas: HTMLCanvasElement;
    lastBackend: "webgpu"|"none" = "none";

    private device: any = null;
    private context: any = null;
    private format: string = "bgra8unorm";
    private samplerNearest: any = null;
    private samplerLinear: any = null;
    private bindGroup0Nearest: any = null;
    private bindGroup0Linear: any = null;
    private uniformBuffer: any = null;
    private bindGroupLayout1: any = null;
    private pipelines: Record<string, any> = { nearest: null, linear: null };
    private instanceBuffer: any = null;
    private instanceCapacity = 0;
    private instanceData = new Float32Array(0);
    private instanceTextures:any[] = [];
    private instanceSmoothing:boolean[] = [];
    private textureCache = new WeakMap<object, BatchTexture>();
    private textureList: BatchTexture[] = [];
    private lost = false;
    private count = 0;
    private matrixBuffer: Matrix2D;
    private localBuffer: Matrix2D;
    private smoothing = false;

    private constructor(canvas:HTMLCanvasElement, device:any, smoothing:boolean)
    {
        this.canvas = canvas;
        this.device = device;
        this.smoothing = smoothing;
        this.matrixBuffer = createMatrix();
        this.localBuffer = createMatrix();

        device.lost?.then?.((info:any) => { this.lost = true; void info; });
    }

    /* Returns null (with `WebGPUSpriteBatch.lastError` set) when this browser or device cannot run
       the batch; callers should keep their canvas drawer in that case. */
    static async create(canvas:HTMLCanvasElement, options:SpriteBatchOptions = {}) : Promise<WebGPUSpriteBatch|null>
    {
        WebGPUSpriteBatch.lastError = null;
        try
        {
            if(!isWebGPUSupported()) { throw new Error("This browser has no WebGPU (navigator.gpu is missing)."); }

            let device = options.device;
            if(!device)
            {
                const adapter = await (navigator as any).gpu.requestAdapter();
                if(!adapter) { throw new Error("No WebGPU adapter available for this machine."); }
                device = await adapter.requestDevice();
            }

            const batch = new WebGPUSpriteBatch(canvas, device, options.smoothing === true);
            batch.setup(options.capacity ?? 2048);
            return batch;
        }
        catch(error)
        {
            WebGPUSpriteBatch.lastError = String((error as Error)?.message ?? error);
            return null;
        }
    }

    get available() : boolean { return !this.lost && this.lastBackend === "webgpu"; }

    private setup(initialCapacity:number)
    {
        const device = this.device;
        const canvas = this.canvas;

        this.context = canvas.getContext("webgpu");
        if(!this.context || typeof this.context.configure !== "function") { throw new Error("No WebGPU canvas context available."); }

        const gpu = (navigator as any).gpu;
        this.format = typeof gpu.getPreferredCanvasFormat === "function" ? gpu.getPreferredCanvasFormat() : "bgra8unorm";
        this.context.configure({ device, format: this.format, alphaMode: "premultiplied" });

        const module = device.createShaderModule({ code: WGSL, label: "pq-sprite-batch" });

        const bindGroupLayout0 = device.createBindGroupLayout({
            label: "pq-sprite-batch-globals",
            entries: [
                { binding: 0, visibility: GPU.GPUShaderStage.VERTEX | GPU.GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
                { binding: 1, visibility: GPU.GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
            ],
        });

        this.bindGroupLayout1 = device.createBindGroupLayout({
            label: "pq-sprite-batch-texture",
            entries: [{ binding: 0, visibility: GPU.GPUShaderStage.FRAGMENT, texture: { sampleType: "float" } }],
        });

        const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout0, this.bindGroupLayout1] });

        const blend = {
            color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
            alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
        };

        const makePipeline = (label:string) => device.createRenderPipeline({
            label: "pq-sprite-batch-" + label,
            layout: pipelineLayout,
            vertex: {
                module: module,
                entryPoint: "vertexMain",
                buffers: [{
                    arrayStride: BYTES_PER_INSTANCE,
                    stepMode: "instance",
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: "float32x4" },
                        { shaderLocation: 1, offset: 16, format: "float32x2" },
                        { shaderLocation: 2, offset: 24, format: "float32x2" },
                        { shaderLocation: 3, offset: 32, format: "float32x4" },
                        { shaderLocation: 4, offset: 48, format: "float32x4" },
                    ],
                }],
            },
            fragment: { module: module, entryPoint: "fragmentMain", targets: [{ format: this.format, blend }] },
            primitive: { topology: "triangle-list" },
        });

        this.pipelines.nearest = makePipeline("nearest");
        this.pipelines.linear = makePipeline("linear");

        this.samplerNearest = device.createSampler({ magFilter: "nearest", minFilter: "nearest", addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" });
        this.samplerLinear = device.createSampler({ magFilter: "linear", minFilter: "linear", addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" });

        this.uniformBuffer = device.createBuffer({ size: 16, usage: GPU.GPUBufferUsage.UNIFORM | GPU.GPUBufferUsage.COPY_DST });
        this.writeCanvasSize();

        this.bindGroup0Nearest = device.createBindGroup({
            layout: bindGroupLayout0,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: this.samplerNearest },
            ],
        });
        this.bindGroup0Linear = device.createBindGroup({
            layout: bindGroupLayout0,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: this.samplerLinear },
            ],
        });

        this.ensureInstanceCapacity(initialCapacity);
        this.lastBackend = "webgpu";
    }

    private writeCanvasSize()
    {
        const data = new Float32Array([this.canvas.width, this.canvas.height, 0, 0]);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, data);
    }

    /** Call after changing canvas.width/height. */
    setCanvasSize() { this.writeCanvasSize(); }

    private ensureInstanceCapacity(capacity:number)
    {
        if(capacity <= this.instanceCapacity && this.instanceBuffer) { return; }

        let next = Math.max(64, this.instanceCapacity || 64);
        while(next < capacity) { next *= 2; }

        if(this.instanceBuffer) { this.instanceBuffer.destroy(); }
        this.instanceBuffer = this.device.createBuffer({
            label: "pq-sprite-batch-instances",
            size: next * BYTES_PER_INSTANCE,
            usage: GPU.GPUBufferUsage.VERTEX | GPU.GPUBufferUsage.COPY_DST,
        });
        this.instanceCapacity = next;
        this.instanceData = new Float32Array(next * FLOATS_PER_INSTANCE);
        this.instanceTextures.length = next;
        this.instanceSmoothing.length = next;
    }

    begin()
    {
        this.count = 0;
    }

    /* Adds one sprite. `entity` carries the same transform fields as the canvas drawer. */
    add(entity:Entity, parent:Matrix2D|null = null)
    {
        const image = entity.image;
        if(!image || entity.visible === false) { return; }

        const framesX = entity.framesX ?? 1;
        const framesY = entity.framesY ?? 1;
        const frameWidth = getImageWidth(image) / framesX;
        const frameHeight = getImageHeight(image) / framesY;
        if(frameWidth <= 0 || frameHeight <= 0) { return; }

        const width = entity.width ?? frameWidth;
        const height = entity.height ?? frameHeight;

        this.addQuad(
            image,
            entity.x ?? 0, entity.y ?? 0,
            entity.rotation ?? 0,
            entity.scaleX ?? 1, entity.scaleY ?? 1,
            entity.anchorX ?? 0, entity.anchorY ?? 0,
            width, height,
            frameWidth, frameHeight,
            entity.frame ?? 0, framesX, framesY,
            entity.alpha ?? 1,
            entity.smoothing ?? this.smoothing,
            parent,
        );
    }

    addQuad(
        image:CanvasImageSource,
        x:number, y:number,
        rotation:number,
        scaleX:number, scaleY:number,
        anchorX:number, anchorY:number,
        width:number, height:number,
        sourceWidth:number, sourceHeight:number,
        frame:number, framesX:number, framesY:number,
        alpha:number,
        smoothing:boolean,
        parent:Matrix2D|null = null,
    )
    {
        if(this.count >= this.instanceCapacity) { this.ensureInstanceCapacity(this.count + 1); }

        const local = this.localBuffer;
        setEntityMatrix(local, x, y, rotation, scaleX, scaleY, anchorX, anchorY, width, height);
        const m = this.matrixBuffer;
        if(parent) { multiplyMatrix(m, parent, local); } else { copyInto(m, local); }

        const index = this.count;
        const offset = index * FLOATS_PER_INSTANCE;
        const data = this.instanceData;

        const sx = frame > 0 ? (frame % framesX) * sourceWidth : 0;
        const sy = frame > 0 ? Math.floor(frame / framesX) * sourceHeight : 0;
        const imageWidth = getImageWidth(image) || 1;
        const imageHeight = getImageHeight(image) || 1;

        data[offset + 0] = m[0];
        data[offset + 1] = m[1];
        data[offset + 2] = m[2];
        data[offset + 3] = m[3];
        data[offset + 4] = m[4];
        data[offset + 5] = m[5];
        data[offset + 6] = width;
        data[offset + 7] = height;
        data[offset + 8] = sx / imageWidth;
        data[offset + 9] = sy / imageHeight;
        data[offset + 10] = (sx + sourceWidth) / imageWidth;
        data[offset + 11] = (sy + sourceHeight) / imageHeight;

        // a flat alpha is all the colour an untextured sprite needs; tinting would go here too
        data[offset + 12] = 1;
        data[offset + 13] = 1;
        data[offset + 14] = 1;
        data[offset + 15] = Math.max(0, Math.min(1, alpha));

        this.instanceTextures[index] = image;
        this.instanceSmoothing[index] = smoothing;
        this.count++;
    }

    /* Uploads the frame and draws it. `clear` keeps the canvas transparent-black by default. */
    end(clear = true)
    {
        if(this.lost || !this.context) { return; }
        this.writeCanvasSize();

        const count = this.count;
        if(count > 0)
        {
            this.device.queue.writeBuffer(this.instanceBuffer, 0, this.instanceData.subarray(0, count * FLOATS_PER_INSTANCE));
        }

        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: clear ? "clear" : "load",
                storeOp: "store",
            }],
        });

        if(count > 0)
        {
            pass.setVertexBuffer(0, this.instanceBuffer);
            let runStart = 0;
            let runTexture = this.instanceTextures[0];
            let runSmoothing = this.instanceSmoothing[0];

            for(let i = 1; i <= count; i++)
            {
                const end = i === count;
                if(!end && this.instanceTextures[i] === runTexture && this.instanceSmoothing[i] === runSmoothing) { continue; }

                const batchTexture = this.textureFor(runTexture);
                if(batchTexture)
                {
                    pass.setPipeline(this.pipelines[batchTexture.nearest ? "nearest" : "linear"]);
                    pass.setBindGroup(0, batchTexture.nearest ? this.bindGroup0Nearest : this.bindGroup0Linear);
                    pass.setBindGroup(1, batchTexture.bindGroup);
                    pass.draw(6, i - runStart, 0, runStart);
                }

                if(!end)
                {
                    runStart = i;
                    runTexture = this.instanceTextures[i];
                    runSmoothing = this.instanceSmoothing[i];
                }
            }
        }

        pass.end();
        this.device.queue.submit([encoder.finish()]);
        this.count = 0;
    }

    /* Draws a whole list in one pass. */
    drawAll(entities:Entity[], parent:Matrix2D|null = null, clear = true)
    {
        this.begin();
        for(let i = 0; i < entities.length; i++) { this.add(entities[i], parent); }
        this.end(clear);
    }

    private textureFor(source:any) : BatchTexture|null
    {
        if(this.lost) { return null; }

        const cached = this.textureCache.get(source);
        if(cached) { return cached.destroyed ? null : cached; }

        const device = this.device;
        const width = Math.max(1, getImageWidth(source));
        const height = Math.max(1, getImageHeight(source));

        try
        {
            const texture = device.createTexture({
                size: [width, height],
                format: "rgba8unorm",
                usage: GPU.GPUTextureUsage.TEXTURE_BINDING | GPU.GPUTextureUsage.COPY_DST | GPU.GPUTextureUsage.RENDER_ATTACHMENT,
            });

            device.queue.copyExternalImageToTexture(
                { source: source },
                { texture: texture, premultiplyAlpha: "premultiply" },
                [width, height],
            );

            const view = texture.createView();
            const batchTexture:BatchTexture = {
                texture: texture,
                view: view,
                bindGroup: device.createBindGroup({
                    layout: this.bindGroupLayout1,
                    entries: [{ binding: 0, resource: view }],
                }),
                nearest: true,
                width: width,
                height: height,
                destroyed: false,
            };
            this.textureCache.set(source, batchTexture);
            this.textureList.push(batchTexture);
            return batchTexture;
        }
        catch(error)
        {
            console.warn(`[WebGPUSpriteBatch] Texture upload failed: ${String((error as Error)?.message ?? error)}`);
            return null;
        }
    }

    /** Re-uploads a source whose pixels changed (a cached text canvas, a generated tile). */
    updateTexture(source:any)
    {
        const cached = this.textureCache.get(source);
        if(!cached || cached.destroyed || this.lost) { return; }

        try
        {
            this.device.queue.copyExternalImageToTexture(
                { source: source },
                { texture: cached.texture, premultiplyAlpha: "premultiply" },
                [cached.width, cached.height],
            );
        }
        catch(error)
        {
            cached.destroyed = true;
        }
    }

    destroy()
    {
        for(const entry of this.textureList) { try { entry.texture.destroy(); } catch(e) {} entry.destroyed = true; }
        this.textureList = [];
        this.textureCache = new WeakMap<object, BatchTexture>();
        if(this.instanceBuffer) { this.instanceBuffer.destroy(); this.instanceBuffer = null; }
        if(this.uniformBuffer) { this.uniformBuffer.destroy(); this.uniformBuffer = null; }
        this.lastBackend = "none";
    }
}

const copyInto = (out:Matrix2D, source:Matrix2D) =>
{
    out[0] = source[0]; out[1] = source[1]; out[2] = source[2];
    out[3] = source[3]; out[4] = source[4]; out[5] = source[5];
}
