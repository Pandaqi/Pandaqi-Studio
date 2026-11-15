import { applyCanvasPixelEffect, canvasSupportsFilters } from "./canvasFilterSupport";
import { EffectsOperation } from "./effectsOperation";
import { LayoutEffect } from "./layoutEffect";

export class InvertEffect extends LayoutEffect
{
    constructor()
    {
        super();
    }

    clone() { return new InvertEffect(); }

    applyToCanvas(ctx:CanvasRenderingContext2D, effOp = new EffectsOperation())
    {
        // Safari ignores canvas filters; applyToCanvasPost() inverts the pixels there instead.
        if(canvasSupportsFilters()) { effOp.addFilter(this.createFilterString()); }
    }

    needsTemporaryCanvas() { return !canvasSupportsFilters(); }

    applyToCanvasPost(ctx:CanvasRenderingContext2D)
    {
        if(canvasSupportsFilters()) { return null; }
        applyCanvasPixelEffect(ctx, (p, i) =>
        {
            p[i] = 255 - p[i];
            p[i + 1] = 255 - p[i + 1];
            p[i + 2] = 255 - p[i + 2];
        });
        return null;
    }

    applyToHTML(div:HTMLDivElement, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    createFilterString()
    {
        return "invert()";
    }

    applyToPixi(filtersConstructor, effOp = new EffectsOperation(), obj)
    {
        const eff = new filtersConstructor.ColorMatrixFilter();
        eff.negative(false);
        effOp.addFilterPixi(eff);
    }
    
}