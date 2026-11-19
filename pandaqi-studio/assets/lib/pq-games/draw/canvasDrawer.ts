import { applyMatrixToContext, copyMatrix, createMatrix, multiplyMatrix, setEntityMatrix, type Matrix2D } from "./matrix";
import { createDrawCache, resetDrawCache, type DrawCache } from "./cache";
import { getImageHeight, getImageWidth } from "./measure";
import type { Entity } from "./entity";

export interface DrawState
{
    ctx: CanvasRenderingContext2D
    /** World matrix of the entity currently being drawn. */
    matrix: Matrix2D
    parent: Matrix2D|null
    depth: number
    cache: DrawCache
    /** Draws a child entity; only the container component uses this. */
    draw: (ctx:CanvasRenderingContext2D, entity:Entity, parent:Matrix2D|null) => void
}

/** One concern of drawing an entity. Register only the ones your game uses. */
export type DrawComponent = (state:DrawState, entity:Entity) => void

export interface CanvasDrawer
{
    readonly ctx: CanvasRenderingContext2D
    readonly components: readonly DrawComponent[]
    draw(entity:Entity, parent?:Matrix2D|null): void
    drawAll(entities:Entity[], parent?:Matrix2D|null): void
    /** Call when something else painted on the canvas, so cached state is re-applied. */
    invalidate(): void
}

const MAX_DEPTH = 64;

/* Builds an entity drawer from the components you hand it.
 *
 * The order is the pipeline: `transform` computes and applies the matrix, `effects` sets alpha /
 * filter / shadow, a content component (sprite, shape or text) paints, and `container` recurses into
 * children. Omitting a component really does remove it: a sprite-only game never links text, shape,
 * effects or container code.
 */
export const createCanvasDrawer = (ctx:CanvasRenderingContext2D, components:DrawComponent[]) : CanvasDrawer =>
{
    const cache = createDrawCache();
    const worldMatrices:Matrix2D[] = [];
    const localMatrices:Matrix2D[] = [];
    const states:DrawState[] = [];

    const getState = (depth:number) : DrawState =>
    {
        let state = states[depth];
        if(!state)
        {
            worldMatrices[depth] = createMatrix();
            localMatrices[depth] = createMatrix();
            state = { ctx, matrix: worldMatrices[depth], parent: null, depth, cache, draw: null };
            states[depth] = state;
        }
        return state;
    }

    const drawOne = (target:CanvasRenderingContext2D, entity:Entity, parent:Matrix2D|null) =>
    {
        drawAt(0, target, entity, parent);
    }

    const drawAt = (depth:number, target:CanvasRenderingContext2D, entity:Entity, parent:Matrix2D|null) =>
    {
        if(!entity || entity.visible === false || depth >= MAX_DEPTH) { return; }

        const state = getState(depth);
        const matrix = state.matrix;
        const local = localMatrices[depth];

        // one scratch pair per depth: children overwrite their own, never their parent's
        const frameX = entity.framesX ?? 1;
        const frameY = entity.framesY ?? 1;
        const width = entity.width ?? (entity.image ? getImageWidth(entity.image) / frameX : 0);
        const height = entity.height ?? (entity.image ? getImageHeight(entity.image) / frameY : 0);

        setEntityMatrix(
            local,
            entity.x ?? 0, entity.y ?? 0,
            entity.rotation ?? 0,
            entity.scaleX ?? 1, entity.scaleY ?? 1,
            entity.anchorX ?? 0, entity.anchorY ?? 0,
            width, height,
        );
        if(parent) { multiplyMatrix(matrix, parent, local); }
        else { copyMatrix(matrix, local); }

        state.ctx = target;
        state.parent = parent;
        state.depth = depth;
        state.draw = drawOne;

        for(let i = 0; i < components.length; i++) { components[i](state, entity); }
    }

    return {
        ctx,
        components,
        draw: (entity, parent = null) => { drawAt(0, ctx, entity, parent); },
        drawAll: (entities, parent = null) =>
        {
            for(let i = 0; i < entities.length; i++) { drawAt(0, ctx, entities[i], parent); }
        },
        invalidate: () => { resetDrawCache(cache); },
    };
}
