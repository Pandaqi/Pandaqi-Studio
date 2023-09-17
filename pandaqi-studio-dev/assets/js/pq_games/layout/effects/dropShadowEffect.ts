import Point from "js/pq_games/tools/geometry/point";
import ResourceImage from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";

interface DropShadowParams
{
    blur?:number,
    size?:number, // legacy support
    blurRadius?:number // legacy support
    color?:string,
    offset?:Point
}

export default class DropShadowEffect extends LayoutEffect
{
    blurRadius: any;
    color: any;
    offset: any;
    
    constructor(params:DropShadowParams = {})
    {
        super(params);

        this.blurRadius = ((params.size ?? params.blur) ?? params.blurRadius) ?? 0;
        this.color = params.color ?? "black";
        this.offset = params.offset ?? new Point();
    }

    clone(deep = false)
    {
        const off = deep ? this.offset.clone() : this.offset;
        const eff = new DropShadowEffect({
            blur: this.blurRadius,
            color: this.color,
            offset: off
        });
        return eff;
    }

    applyToCanvas(ctx:CanvasRenderingContext2D)
    {
        ctx.filter += this.createFilterString();
    }

    applyToHTML(div:HTMLDivElement)
    {
        div.style.filter += this.createFilterString();
    }

    createFilterString()
    {
        return " drop-shadow(" + this.offset.x + "px " + this.offset.y + "px " + this.blurRadius + "px " + this.color + ")"
    }
    
}