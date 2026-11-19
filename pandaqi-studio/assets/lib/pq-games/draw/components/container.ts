import { applyMatrixToContext } from "../matrix";
import { resetDrawCache } from "../cache";
import type { DrawComponent } from "../canvasDrawer";

/* Draws `entity.children` in this entity's coordinate space.
 *
 * Children inherit the parent matrix, so a group only needs its own transform (rotation, scale,
 * a moving container) and everything inside follows. Keep this last in the component list: it
 * restores the parent transform afterwards, but not the fill/alpha the children left behind, which
 * is why the state cache is invalidated when it returns.
 */
export const containerComponent:DrawComponent = (state, entity) =>
{
    const children = entity.children;
    if(!children || children.length === 0) { return; }

    const ctx = state.ctx;
    const clip = entity.clip ?? null;

    if(clip)
    {
        ctx.save();
        ctx.clip(clip);
    }

    for(let i = 0; i < children.length; i++)
    {
        state.draw(ctx, children[i], state.matrix);
    }

    if(clip) { ctx.restore(); }

    // the last child left its own transform, alpha and paint state on the context
    applyMatrixToContext(ctx, state.matrix);
    resetDrawCache(state.cache);
}
