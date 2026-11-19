import type { DrawComponent } from "../canvasDrawer";

/* Alpha, blend mode, canvas filter and shadow.
 *
 * Each property is written only when it differs from what the drawer last set, which is the whole
 * point of keeping this as its own component: an entity without effects costs six comparisons.
 */
export const effectsComponent:DrawComponent = (state, entity) =>
{
    const ctx = state.ctx;
    const cache = state.cache;

    const alpha = entity.alpha ?? 1;
    if(cache.alpha !== alpha)
    {
        ctx.globalAlpha = alpha;
        cache.alpha = alpha;
    }

    const composite = entity.composite ?? "source-over";
    if(cache.composite !== composite)
    {
        ctx.globalCompositeOperation = composite;
        cache.composite = composite;
    }

    const filter = entity.filter ?? "none";
    if(cache.filter !== filter)
    {
        ctx.filter = filter;
        cache.filter = filter;
    }

    const shadowBlur = entity.shadowBlur ?? 0;
    const shadowColor = entity.shadowColor ?? "#000000";
    const shadowOffsetX = entity.shadowOffsetX ?? 0;
    const shadowOffsetY = entity.shadowOffsetY ?? 0;

    if(cache.shadowBlur !== shadowBlur) { ctx.shadowBlur = shadowBlur; cache.shadowBlur = shadowBlur; }
    if(cache.shadowColor !== shadowColor) { ctx.shadowColor = shadowColor; cache.shadowColor = shadowColor; }
    if(cache.shadowOffsetX !== shadowOffsetX) { ctx.shadowOffsetX = shadowOffsetX; cache.shadowOffsetX = shadowOffsetX; }
    if(cache.shadowOffsetY !== shadowOffsetY) { ctx.shadowOffsetY = shadowOffsetY; cache.shadowOffsetY = shadowOffsetY; }
}
