/* The realtime drawing layer: a small, dependency-free alternative to the document pipeline.
 *
 * Realtime sprites go through `createSpriteRenderer` (WebGPU when the machine has an adapter, the
 * canvas drawer otherwise). The document pipeline stays on `createRenderer`, which is canvas.
 *
 *     import { createCanvasDrawer } from "lib/pq-games/draw/canvasDrawer";
 *     import { transformComponent } from "lib/pq-games/draw/components/transform";
 *     import { spriteComponent } from "lib/pq-games/draw/components/sprite";
 *
 *     const draw = createCanvasDrawer(ctx, [transformComponent, spriteComponent]);
 *     draw.drawAll(entities);
 *
 * Every module here is side-effect free, so a bundler that tree-shakes ES modules drops whatever
 * your game does not import: an image-only game never links text, shapes, filters or the GPU batch.
 * Import from the individual paths for the tightest bundle, or from this index for convenience.
 */

export * from "./matrix";
export * from "./entity";
export * from "./cache";
export * from "./measure";
export * from "./canvasDrawer";
export * from "./presets";
export * from "./spriteRenderer";

export * from "./components/transform";
export * from "./components/effects";
export * from "./components/sprite";
export * from "./components/shape";
export * from "./components/text";
export * from "./components/container";

export * from "./webgpu/spriteBatch";
