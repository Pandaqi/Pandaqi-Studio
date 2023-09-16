import Point from "js/pq_games/tools/geometry/point";
import ResourceImage from "../../layout/resources/resourceImage"
import createContext from "../createContext"
import CanvasEffect from "./canvasEffect";

export default class DropShadowEffect extends CanvasEffect
{
    blurRadius: any;
    color: any;
    offset: any;
    
    constructor(params:Record<string,any> = {})
    {
        super(params);

        this.blurRadius = ((params.size ?? params.blur) ?? params.blurRadius) ?? 0;
        this.color = params.color ?? "black";
        this.offset = params.offset ?? new Point();
    }

    createFilterString()
    {
        return "drop-shadow(" + this.offset.x + "px " + this.offset.y + "px " + this.blurRadius + "px " + this.color + ")"
    }

    async applyToContext(ctx:CanvasRenderingContext2D, image:ResourceImage = null)
    {
        ctx.filter += this.createFilterString() + " ";
    }

    applyToHTML(div:HTMLDivElement)
    {
        div.style.filter += this.createFilterString() + " ";
    }
}