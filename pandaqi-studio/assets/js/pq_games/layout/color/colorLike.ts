import LayoutOperation from "../layoutOperation";
import ResourceGradient from "../resources/resourceGradient";
import ResourcePattern from "../resources/resourcePattern";
import Color from "./color";

type ColorLikeValue = Color|ResourceGradient|ResourcePattern;

export { ColorLike, ColorLikeValue }
export default class ColorLike
{
    val:ColorLikeValue

    constructor(val:string|ColorLikeValue)
    {
        if(val instanceof ResourcePattern || val instanceof ResourceGradient) { this.val = val; }
        else {
            this.val = new Color(val);
        }
    }

    get() { return this.val; }
    toCSS()
    {
        return this.val.toCSS();
    }

    toCanvasStyle(ctx:CanvasRenderingContext2D)
    {
        if(this.val instanceof Color) { return this.val.toString(); }
        return this.val.toCanvasStyle(ctx);
    }

    isTransparent()
    {
        return this.val.isTransparent();
    }
}