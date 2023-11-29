import Point from "js/pq_games/tools/geometry/point";
import LayoutEffect from "./layoutEffect";
import { EffectData } from "../layoutOperation";

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

    applyToCanvas(ctx:CanvasRenderingContext2D, effectData:EffectData = {})
    {
        effectData.filters.push(this.createFilterString());
    }

    applyToHTML(div:HTMLDivElement, effectData:EffectData = {})
    {
        effectData.filters.push(this.createFilterString());
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