import Point from "js/pq_games/tools/geometry/point";
import ResourceImage from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";
import { EffectData } from "../layoutOperation";

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
        return "grayscale(" + this.intensity + ")";
    }
    
}