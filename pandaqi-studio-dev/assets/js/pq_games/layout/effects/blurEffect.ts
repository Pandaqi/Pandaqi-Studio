import Point from "js/pq_games/tools/geometry/point";
import LayoutEffect from "./layoutEffect";
import EffectsOperation from "./effectsOperation";

import { KawaseBlurFilter } from "../../pixi/pixi-filters.mjs";

export default class BlurEffect extends LayoutEffect
{
    blur:number;
    
    constructor(blur:number)
    {
        super({});
        this.blur = blur;
    }

    clone(deep = false)
    {
        return new BlurEffect(this.blur);
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
        effOp.addFilterPixi(new KawaseBlurFilter({
            strength: this.blur
        }));
    }

    createFilterString()
    {
        return "blur(" + this.blur + "px)";
    }

    getExtraSizeAdded()
    {
        return new Point(0.5*this.blur);
    }
    
}