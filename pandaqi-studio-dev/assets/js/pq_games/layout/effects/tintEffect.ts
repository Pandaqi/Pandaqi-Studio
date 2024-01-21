import ResourceImage, { CanvasDrawableLike } from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import Color from "../color/color";
import { EffectData } from "../layoutOperation";
import getTintCSSFilters from "./tintEffectSolver";
import Point from "js/pq_games/tools/geometry/point";

interface TintEffectParams
{
    color?: Color|string,
    from?: Color|string
}

export default class TintEffect extends LayoutEffect
{
    color: Color
    from: Color

    constructor(params:TintEffectParams|string = {})
    {
        if(typeof params !== "object") { params = { color: params }; }
        super(params);
        this.color = new Color(params.color ?? "#FFFFFF");
        this.from = new Color(params.from ?? "#FFFFFF");
    }

    clone(deep = false)
    {
        return new TintEffect({ color: this.color });
    }

    applyToImage(drawable:CanvasDrawableLike)
    {
        // first, we get a mask just with the tint color
        const contextParams = { size: drawable.getSize(), alpha: true }
        const ctx = createContext(contextParams);
        ctx.drawImage(drawable.getImage(), 0, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, 0, contextParams.size.x, contextParams.size.y);

        // then we multiply that mask with the original image to do an actual, proper tinting
        const ctx2 = createContext(contextParams);
        ctx2.drawImage(drawable.getImage(), 0, 0);
        ctx2.globalCompositeOperation = "multiply";
        ctx2.drawImage(ctx.canvas, 0, 0);

        return new CanvasDrawableLike(ctx2.canvas);
    }

    applyToHTML(div:HTMLElement, effectData:EffectData = {})
    {
        const filters = getTintCSSFilters(this.color, this.from);
        for(const filter of filters)
        {
            effectData.filters.push(filter);
        }
    }
}