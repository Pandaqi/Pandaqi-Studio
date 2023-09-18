import ResourceImage from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import Color from "../color/color";
import { EffectData } from "../layoutOperation";

export default class TintEffect extends LayoutEffect
{
    color: Color

    constructor(params:Record<string,any> = {})
    {
        super(params);
        this.color = new Color(params.color ?? "#FFFFFF");
    }

    clone(deep = false)
    {
        return new TintEffect({ color: this.color });
    }

    async applyToImage(image:ResourceImage)
    {
        // first, we get a mask just with the tint color
        const contextParams = { size: image.size, alpha: true }
        const ctx = createContext(contextParams);
        ctx.drawImage(image.getImage(), 0, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, 0, contextParams.size.x, contextParams.size.y);

        // then we multiply that mask with the original image to do an actual, proper tinting
        const ctx2 = createContext(contextParams);
        ctx2.drawImage(image.getImage(), 0, 0);
        ctx2.globalCompositeOperation = "multiply";
        ctx2.drawImage(ctx.canvas, 0, 0);

        const img = await convertCanvasToImage(ctx2.canvas);
        return image.clone().swapImage(img);
    }

    // @TODO: not really a robust system for tinting ...
    applyToHTML(div:HTMLElement, effectData:EffectData = {})
    {
        div.style.mixBlendMode = "multiply";
        div.style.backgroundColor = this.color.toString();
    }
}