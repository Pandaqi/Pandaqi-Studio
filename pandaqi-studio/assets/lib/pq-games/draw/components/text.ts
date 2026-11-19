import type { DrawComponent } from "../canvasDrawer";

const DEFAULT_FONT = "16px sans-serif";
const DEFAULT_FILL = "#000000";

/* Plain canvas text: one entity, one string.
 *
 * Rich text (wrapping, chunks, inline images) is ResourceText's job in the document pipeline; a game
 * HUD does not need any of it, so this component is deliberately just `fillText`/`strokeText`.
 */
export const textComponent:DrawComponent = (state, entity) =>
{
    const text = entity.text;
    if(!text) { return; }

    const ctx = state.ctx;
    const cache = state.cache;

    const font = entity.font ?? DEFAULT_FONT;
    if(cache.font !== font)
    {
        ctx.font = font;
        cache.font = font;
    }

    const textAlign = entity.textAlign ?? "left";
    if(cache.textAlign !== textAlign)
    {
        ctx.textAlign = textAlign;
        cache.textAlign = textAlign;
    }

    const textBaseline = entity.textBaseline ?? "alphabetic";
    if(cache.textBaseline !== textBaseline)
    {
        ctx.textBaseline = textBaseline;
        cache.textBaseline = textBaseline;
    }

    const fill = entity.fill ?? DEFAULT_FILL;
    const strokeWidth = entity.strokeWidth ?? 0;
    const stroke = (entity.stroke && strokeWidth > 0) ? entity.stroke : null;

    const x = entity.textX ?? 0;
    const y = entity.textY ?? 0;

    if(fill && cache.fill !== fill)
    {
        ctx.fillStyle = fill as any;
        cache.fill = fill;
    }

    if(stroke)
    {
        const lineWidth = Math.round(strokeWidth);
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
        ctx.strokeText(text, x, y);
    }

    if(fill) { ctx.fillText(text, x, y); }
}
