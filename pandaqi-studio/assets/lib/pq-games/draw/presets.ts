import { createCanvasDrawer, type CanvasDrawer, type DrawComponent } from "./canvasDrawer";
import { transformComponent } from "./components/transform";
import { effectsComponent } from "./components/effects";
import { spriteComponent } from "./components/sprite";
import { shapeComponent } from "./components/shape";
import { textComponent } from "./components/text";
import { containerComponent } from "./components/container";

/* Ready-made component lists, smallest first.
 *
 * The lists are plain arrays so a game can copy one and add or drop a component:
 *     createCanvasDrawer(ctx, [...SHAPE_PRESET, myCustomComponent])
 */

/** Moving pictures, nothing else. */
export const SPRITE_PRESET:DrawComponent[] = [transformComponent, effectsComponent, spriteComponent];

/** Sprites that can hold other sprites (a rotating ship with a turret, a moving UI panel). */
export const SPRITE_TREE_PRESET:DrawComponent[] = [...SPRITE_PRESET, containerComponent];

/** Flat-colour / stroked paths. */
export const SHAPE_PRESET:DrawComponent[] = [transformComponent, effectsComponent, shapeComponent];

/** Canvas text. */
export const TEXT_PRESET:DrawComponent[] = [transformComponent, effectsComponent, textComponent];

/** Everything, in the order the pipeline needs: transform, effects, content, children. */
export const FULL_PRESET:DrawComponent[] = [
    transformComponent, effectsComponent, spriteComponent, shapeComponent, textComponent, containerComponent,
];

export const createSpriteDrawer = (ctx:CanvasRenderingContext2D) : CanvasDrawer => createCanvasDrawer(ctx, SPRITE_PRESET);
export const createShapeDrawer = (ctx:CanvasRenderingContext2D) : CanvasDrawer => createCanvasDrawer(ctx, SHAPE_PRESET);
export const createTextDrawer = (ctx:CanvasRenderingContext2D) : CanvasDrawer => createCanvasDrawer(ctx, TEXT_PRESET);
export const createFullDrawer = (ctx:CanvasRenderingContext2D) : CanvasDrawer => createCanvasDrawer(ctx, FULL_PRESET);
