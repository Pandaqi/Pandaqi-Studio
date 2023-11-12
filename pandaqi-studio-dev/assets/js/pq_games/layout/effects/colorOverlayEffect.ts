import ResourceImage from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import Color from "../color/color";
import { EffectData } from "../layoutOperation";
import getTintCSSFilters from "./tintEffectSolver";

export default class ColorOverlayEffect extends LayoutEffect
{
    color: Color

    constructor(color:Color)
    {
        super({});
        this.color = new Color(color ?? "#000000");
    }

    clone(deep = false)
    {
        return new ColorOverlayEffect(deep ? this.color.clone() : this.color);
    }

    async applyToImage(image:ResourceImage)
    {
        // we draw the image
        const contextParams = { size: image.size, alpha: true }
        const ctx = createContext(contextParams);
        ctx.drawImage(image.getImage(), 0, 0);

        // then (using composite) draw a flat color on each filled-in pixel
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, 0, contextParams.size.x, contextParams.size.y);

        // that's it; replace new image with old one
        const img = await convertCanvasToImage(ctx.canvas);
        return image.clone().swapImage(img);
    }

    applyToHTML(div:HTMLElement, effectData:EffectData = {})
    {
        // @TODO: Currently not implemented! Don't see how!
    }
}