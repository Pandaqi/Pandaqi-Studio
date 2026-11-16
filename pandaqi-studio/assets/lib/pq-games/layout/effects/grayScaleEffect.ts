import { applyCanvasPixelEffect, canvasSupportsFilters } from "./canvasFilterSupport";
import { EffectsOperation } from "./effectsOperation";
import { LayoutEffect } from "./layoutEffect";

export class GrayScaleEffect extends LayoutEffect
{
    intensity: number;

    constructor(intensity:number = 1.0)
    {
        super();

        this.intensity = intensity ?? 1.0;
    }

    clone()
    {
        return new GrayScaleEffect(this.intensity);
    }

    applyToCanvas(ctx:CanvasRenderingContext2D, effOp = new EffectsOperation())
    {
        // Safari ignores canvas filters; applyToCanvasPost() does the same thing per pixel there instead.
        if(canvasSupportsFilters()) { effOp.addFilter(this.createFilterString()); }
    }

    // Without a working filter the operation needs its own canvas, so the fallback only desaturates this
    // operation and not whatever is already underneath it.
    needsTemporaryCanvas() { return !canvasSupportsFilters(); }

    applyToCanvasPost(ctx:CanvasRenderingContext2D)
    {
        if(canvasSupportsFilters()) { return null; }

        const intensity = Math.max(0, Math.min(1, this.intensity));
        applyCanvasPixelEffect(ctx, (p, i) =>
        {
            const luminance = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
            p[i] += (luminance - p[i]) * intensity;
            p[i + 1] += (luminance - p[i + 1]) * intensity;
            p[i + 2] += (luminance - p[i + 2]) * intensity;
        });
        return null;
    }

    applyToHTML(div:HTMLDivElement, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    applyToPixi(filtersConstructor, effOp = new EffectsOperation(), obj)
    {
        effOp.addFilterPixi(new filtersConstructor.GrayscaleFilter());
    }

    createFilterString()
    {
        return "grayscale(" + this.intensity + ")";
    }
    
}