import ResourceImage from "../resources/resourceImage"
import createContext from "../canvas/createContext"
import LayoutEffect from "./layoutEffect";
import Color from "../color/color";
import EffectsOperation from "./effectsOperation";

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

    applyToImage(drawable:ResourceImage)
    {
        // we draw the image
        const contextParams = { size: drawable.getSize(), alpha: true }
        const ctx = createContext(contextParams);
        ctx.drawImage(drawable.getImage(), 0, 0);

        // then (using composite) draw a flat color on each filled-in pixel
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, 0, contextParams.size.x, contextParams.size.y);

        return new ResourceImage(ctx.canvas);
    }

    applyToHTML(div:HTMLElement, effOp = new EffectsOperation())
    {
        // @TODO: Currently not implemented! Don't see how!
    }
}