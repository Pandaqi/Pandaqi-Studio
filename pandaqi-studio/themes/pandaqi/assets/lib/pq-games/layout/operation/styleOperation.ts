import { isZero } from "../../tools/numbers/checks";
import { Color } from "../color/color";
import { ColorLike } from "../color/colorLike";
import type { ColorLikeValue } from "../color/colorLike";
import { isColorTransparent } from "../color/mixing";
import type { Path } from "../../geometry/path";
import { StrokeAlign, StrokeType } from "../values";
import type { LayoutOperationParams } from "./types";

// Everything that decides *how* an operation paints: fill, stroke, alpha, blending and tint.
// Split from the transform half so an operation that only moves something does not need to
// carry (or allocate) a fill/stroke/colour state it never uses.
export class StyleOperation
{
    fill: ColorLike
    stroke: ColorLike
    strokeWidth: number
    strokeAlign: StrokeAlign
    strokeType: string

    alpha: number
    composite: GlobalCompositeOperation
    tint: Color

    constructor(params:LayoutOperationParams = {})
    {
        this.fill = new ColorLike(params.fill);
        this.tint = new Color(params.tint);
        this.stroke = new ColorLike(params.stroke);

        this.strokeWidth = params.strokeWidth ?? 0;
        if(typeof this.strokeWidth != "number") { console.error(`Invalid strokeWidth ${this.strokeWidth} set in LayoutOperation`, params); this.strokeWidth = 0; }

        this.strokeType = params.strokeType ?? StrokeType.REGULAR;
        this.strokeAlign = params.strokeAlign ?? StrokeAlign.MIDDLE;

        this.alpha = params.alpha ?? 1.0;
        if(typeof this.alpha != "number") { console.error(`Invalid alpha ${this.alpha} set in LayoutOperation`, params); this.alpha = 1.0; }

        this.composite = params.composite ?? "source-over";
    }

    hasFill() { return !this.fill.isTransparent(); }
    hasStroke() { return !this.stroke.isTransparent() && !isZero(this.strokeWidth); }
    hasTint() { return !isColorTransparent(this.tint); }
    getTint() { return this.hasTint() ? this.tint.toHEXNumber() : 0xFFFFFF; }

    setFill(c:string|ColorLikeValue) { this.fill = new ColorLike(c); return this; }
    setStroke(s:string|ColorLikeValue) { this.stroke = new ColorLike(s); return this; }
    setFillAndStroke(c:string|ColorLikeValue, s:string|ColorLikeValue)
    {
        this.setFill(c);
        this.setStroke(s);
        return this;
    }

    setOuterStroke(s:string|ColorLikeValue, w:number)
    {
        this.setStroke(s);
        this.strokeWidth = w;
        this.strokeAlign = StrokeAlign.OUTSIDE;
        return this;
    }

    setOnContext(ctx:CanvasRenderingContext2D)
    {
        ctx.fillStyle = this.fill.toCanvasStyle(ctx);
        ctx.strokeStyle = this.stroke.toCanvasStyle(ctx);

        let lineWidth = Math.round(this.strokeWidth);
        if(this.strokeAlign != StrokeAlign.MIDDLE) { lineWidth *= 2; }
        ctx.lineWidth = lineWidth;

        // Dashed strokes are part of StrokeType, but the canvas renderer used to ignore them
        // completely. Always set the dash (also when empty), because the context is shared between
        // operations and a previous dashed operation would otherwise leak into this one.
        if(typeof (ctx as any).setLineDash == "function")
        {
            const dashSize = Math.max(lineWidth, 1) * 2;
            ctx.setLineDash(this.strokeType === StrokeType.DASHED ? [dashSize, dashSize] : []);
        }
    }

    applyToPath(ctx:CanvasRenderingContext2D, path:Path2D, callback:Function = null)
    {
        const hasFill = this.hasFill();
        const hasStroke = this.hasStroke();

        const strokeBeforeFill = this.strokeAlign == StrokeAlign.OUTSIDE && hasStroke;
        const clipStroke = this.strokeAlign == StrokeAlign.INSIDE && hasStroke;

        if(clipStroke) { ctx.save(); ctx.clip(path); }

        if(strokeBeforeFill) {
            if(hasStroke) { ctx.stroke(path); }
            if(hasFill) { ctx.fill(path); }
            if(callback) { callback(); }
        } else {
            if(hasFill) { ctx.fill(path); }
            if(callback) { callback(); }
            if(hasStroke) { ctx.stroke(path); }
        }

        if(clipStroke) { ctx.restore(); }
    }

    // Shallow by design: colour objects are effectively immutable in the codebase and sharing them
    // between an operation and its clone is the historical (and cheapest) behaviour.
    clone() : StyleOperation
    {
        const style = new StyleOperation();
        style.fill = this.fill;
        style.stroke = this.stroke;
        style.strokeWidth = this.strokeWidth;
        style.strokeAlign = this.strokeAlign;
        style.strokeType = this.strokeType;
        style.alpha = this.alpha;
        style.composite = this.composite;
        style.tint = this.tint;
        return style;
    }
}
