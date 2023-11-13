import ResourceImage from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import Color from "../color/color";
import { EffectData } from "../layoutOperation";
import Point from "js/pq_games/tools/geometry/point";

interface OutlineEffectParams
{
    color?: Color,
    thickness?: number,
}

const OFFSETS = [
    new Point(-1,-1),
    new Point(0,-1),
    new Point(1,-1),
    new Point(-1,0),
    new Point(1,0),
    new Point(-1,1),
    new Point(0,1),
    new Point(1,1)
]

export default class OutlineEffect extends LayoutEffect
{
    color: Color
    thickness: number

    constructor(params:OutlineEffectParams = {})
    {
        super(params);
        this.color = new Color(params.color ?? "#FFFFFF");
        this.thickness = params.thickness ?? 5;
    }

    clone(deep = false)
    {
        return new OutlineEffect({ color: this.color.clone(), thickness: this.thickness });
    }

    // @SOURCE: https://stackoverflow.com/questions/28207232/draw-border-around-nontransparent-part-of-image-on-canvas
    async applyToImage(image:ResourceImage)
    {
        const contextParams = { size: image.size, alpha: true }
        const ctx = createContext(contextParams);

        // just draw the image many times, but offset in all directions
        for(let i = 0; i < OFFSETS.length; i++)
        {
            const pos = OFFSETS[i].clone().scale(this.thickness);
            ctx.drawImage(image.getImage(), pos.x, pos.y);
        }

        // use composite mode to make all these redraws the same color
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, 0, image.size.x, image.size.y);

        // then just draw the original image on top (in normal composite mode)
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(image.getImage(), 0, 0);

        // and replace original with the new one
        const img = await convertCanvasToImage(ctx.canvas);
        return image.clone().swapImage(img);
    }

    // @SOURCE: https://stackoverflow.com/questions/12690444/css-border-on-png-image-with-transparent-parts (further down the page)
    applyToHTML(div:HTMLElement, effectData:EffectData = {})
    {
        const t = this.thickness;
        const c = this.color.toString();
        const filters = [];
        for(let i = 0; i < OFFSETS.length; i++)
        {
            const pos = OFFSETS[i].clone().scale(this.thickness);
            filters.push("drop-shadow(" + pos.x + "px " + pos.y + "px 0 " + c + ")");
        }

        for(const filter of filters)
        {
            effectData.filters.push(filter);
        }
    }
}