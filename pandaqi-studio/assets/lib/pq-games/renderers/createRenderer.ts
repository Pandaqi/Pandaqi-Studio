import { RendererPandaqi } from "./pandaqi/rendererPandaqi";
import { RendererPandaqiWebGPU } from "./pandaqi/rendererPandaqiWebGPU";
import type { Renderer } from "./renderer";

/* Which renderer you get when you do not pick one: the canvas renderer.
 *
 * That is deliberate. The document pipeline (cards, boards, rulebooks, PDFs) draws one huge page at a
 * time and every existing game page already goes through it, so it stays on the verified canvas path.
 * WebGPU belongs to the realtime layer, where a frame is many small quads: `draw/spriteRenderer`
 * prefers the GPU batch and falls back to the canvas drawer there. Pass `force: "webgpu"` to opt a
 * document render into the GPU renderer; it falls back to canvas per draw when there is no adapter.
 */

export interface CreateRendererParams
{
    force?: "webgpu" | "canvas"
    /** Share a device between renderers instead of requesting one each time. */
    device?: any
}

export const isWebGPURendererSupported = () : boolean =>
{
    return typeof navigator !== "undefined" && !!(navigator as any).gpu;
}

export const createRenderer = (params:CreateRendererParams = {}) : Renderer =>
{
    if(params.force !== "webgpu") { return new RendererPandaqi(); }
    return new RendererPandaqiWebGPU({ device: params.device });
}
