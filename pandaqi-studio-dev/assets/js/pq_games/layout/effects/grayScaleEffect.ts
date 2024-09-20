import { GrayscaleFilter } from "js/pq_games/pixi/pixi-filters.mjs";
import EffectsOperation from "./effectsOperation";
import LayoutEffect from "./layoutEffect";

export default class GrayScaleEffect extends LayoutEffect
{
    intensity: number;

    constructor(intensity:number = 1.0)
    {
        super();

        this.intensity = intensity ?? 1.0;
    }

    clone(deep = false)
    {
        return new GrayScaleEffect(this.intensity);
    }

    applyToCanvas(ctx:CanvasRenderingContext2D, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    applyToHTML(div:HTMLDivElement, effOp = new EffectsOperation())
    {
        effOp.addFilter(this.createFilterString());
    }

    applyToPixi(effOp = new EffectsOperation(), obj)
    {
        effOp.addFilterPixi(new GrayscaleFilter());
    }

    createFilterString()
    {
        return "grayscale(" + this.intensity + ")";
    }
    
}