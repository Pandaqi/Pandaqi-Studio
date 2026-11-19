/* Realtime sprites: WebGPU by default, the canvas drawer when the machine cannot run it.
 *
 * This is the one place the GPU is the default, because a realtime frame is many small quads, which is
 * exactly what `WebGPUSpriteBatch` batches. The document pipeline (`createRenderer`) stays on canvas.
 *
 *     const sprites = await createSpriteRenderer(canvas);
 *     sprites.drawAll(entities);
 *
 * The GPU path is sprites only: shapes and text stay on the canvas drawer (`draw/presets.ts`), which
 * the fallback also uses. Both backends share one interface, so a game only branches when it wants
 * `backend` (to pick which of two stacked canvases to show) or `error` (to explain a fallback).
 */

import { createCanvasDrawer } from "./canvasDrawer";
import { SPRITE_PRESET } from "./presets";
import { WebGPUSpriteBatch, type SpriteBatchOptions } from "./webgpu/spriteBatch";
import type { Entity } from "./entity";
import type { Matrix2D } from "./matrix";

export type SpriteRendererBackend = "webgpu" | "canvas";

export interface SpriteRendererOptions extends SpriteBatchOptions
{
    /** `false` skips the GPU attempt and keeps the canvas drawer (useful for comparing the two). */
    preferGPU?: boolean
}

export interface SpriteRenderer
{
    readonly canvas: HTMLCanvasElement
    readonly backend: SpriteRendererBackend
    /** Why WebGPU was refused, when it was; `null` when the GPU batch runs. */
    readonly error: string|null
    /** Clears the canvas, then draws every entity (one instanced draw batch on the GPU). */
    drawAll(entities:Entity[], parent?:Matrix2D|null): void
    /** Sets canvas.width/height; the next draw uses the new size. */
    resize(width:number, height:number): void
    /** Call when something else painted on the canvas (canvas backend only). */
    invalidate(): void
    destroy(): void
}

export const createSpriteRenderer = async (canvas:HTMLCanvasElement, options:SpriteRendererOptions = {}) : Promise<SpriteRenderer> =>
{
    if(options.preferGPU !== false)
    {
        const batch = await WebGPUSpriteBatch.create(canvas, options);
        if(batch) { return createGPURenderer(canvas, batch); }
    }

    // A canvas hands out one context type for its lifetime. The attempt above only asks for "webgpu"
    // after an adapter was found, so a refused adapter leaves the canvas free for "2d".
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D|null;
    if(!ctx) { throw new Error("[spriteRenderer] No 2D canvas context available for the fallback."); }

    const drawer = createCanvasDrawer(ctx, SPRITE_PRESET);
    return {
        canvas,
        backend: "canvas",
        error: options.preferGPU === false ? null : (WebGPUSpriteBatch.lastError ?? "WebGPU was not attempted."),
        drawAll: (entities, parent = null) =>
        {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawer.drawAll(entities, parent);
        },
        resize: (width, height) => { canvas.width = width; canvas.height = height; drawer.invalidate(); },
        invalidate: () => { drawer.invalidate(); },
        destroy: () => {},
    };
};

const createGPURenderer = (canvas:HTMLCanvasElement, batch:WebGPUSpriteBatch) : SpriteRenderer =>
{
    return {
        canvas,
        backend: "webgpu",
        error: null,
        drawAll: (entities, parent = null) => { batch.drawAll(entities, parent, true); },
        resize: (width, height) => { canvas.width = width; canvas.height = height; batch.setCanvasSize(); },
        invalidate: () => {},
        destroy: () => { batch.destroy(); },
    };
};
