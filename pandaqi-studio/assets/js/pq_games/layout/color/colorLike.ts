// @TODO: For now, I've completely removed these resources, because they SOMEHOW lead to PixiJS being included with EVERY script that uses ColorLike
//import ResourceGradient from "../resources/resourceGradient";
//import ResourcePattern from "../resources/resourcePattern";
import Color from "./color";

//type ColorLikeValue = Color|ResourceGradient|ResourcePattern;
type ColorLikeValue = Color;

export { ColorLike, ColorLikeValue };
export default class ColorLike
{
    val:ColorLikeValue

    constructor(val:string|ColorLikeValue)
    {
        this.val = new Color(val);

        /*if(val instanceof ResourcePattern || val instanceof ResourceGradient) { this.val = val; }
        else {
            this.val = new Color(val);
        }*/
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

    // @TODO: any other values don't make sense for toNumber, right?
    toNumber()
    {
        if(this.val instanceof Color) { return this.val.toHEXNumber(); }
        return 16777215;
    }

    isTransparent()
    {
        return this.val.isTransparent();
    }
}