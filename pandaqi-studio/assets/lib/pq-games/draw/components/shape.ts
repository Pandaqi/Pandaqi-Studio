import { resetDrawCache } from "../cache";
import type { DrawComponent } from "../canvasDrawer";

/* Fill and stroke for `entity.shape` (any Path2D).
 *
 * Stroke alignment matches the document renderer: OUTSIDE strokes first (then fill on top), INSIDE
 * strokes clipped to the path, MIDDLE fill then stroke. Inside strokes are the only case that needs
 * save/restore, and that invalidates the state cache because restore resets the context.
 */
export const shapeComponent:DrawComponent = (state, entity) =>
{
    const path = entity.shape;
    if(!path) { return; }

    const ctx = state.ctx;
    const cache = state.cache;

    const fill = entity.fill ?? null;
    const strokeWidth = entity.strokeWidth ?? 0;
    const stroke = (entity.stroke && strokeWidth > 0) ? entity.stroke : null;
    if(!fill && !stroke) { return; }

    if(fill && cache.fill !== fill)
    {
        ctx.fillStyle = fill as any;
        cache.fill = fill;
    }

    if(stroke)
    {
        const align = entity.strokeAlign ?? "middle";
        const lineWidth = Math.round(strokeWidth) * (align === "middle" ? 1 : 2);
        if(cache.stroke !== stroke)
        {
            ctx.strokeStyle = stroke;
            cache.stroke = stroke;
        }
        if(cache.lineWidth !== lineWidth)
        {
            ctx.lineWidth = lineWidth;
            cache.lineWidth = lineWidth;
        }

        if(align === "outside")
        {
            ctx.stroke(path);
            if(fill) { ctx.fill(path); }
            return;
        }

        if(align === "inside")
        {
            ctx.save();
            ctx.clip(path);
            ctx.stroke(path);
            ctx.restore();
            resetDrawCache(cache);
            if(fill)
            {
                ctx.fillStyle = fill as any;
                cache.fill = fill;
                ctx.fill(path);
            }
            return;
        }

        if(fill) { ctx.fill(path); }
        ctx.stroke(path);
        return;
    }

    if(fill) { ctx.fill(path); }
}
