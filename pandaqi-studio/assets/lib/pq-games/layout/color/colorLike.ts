import type { ResourceGradient } from "../resources/resourceGradient";
import type { ResourcePattern } from "../resources/resourcePattern";
import { Color } from "./color";
import { isColorTransparent } from "./mixing";

type ColorLikeValue = Color|ResourceGradient|ResourcePattern;

export { ColorLikeValue };
export class ColorLike
{
    val:ColorLikeValue

    constructor(val:string|ColorLikeValue)
    {
        if(!val) { 
            this.val = Color.TRANSPARENT; 
        } else if(typeof val === "string") {
            this.val = new Color(val);
        } else {
            this.val = val;
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

    toNumber()
    {
        if(this.val instanceof Color) { return this.val.toHEXNumber(); }
        return 16777215;
    }

    // `toNumber()` is RGB only, so a colour's own alpha ("#00000044", a 30% black shadow) has to be
    // asked for separately by renderers that paint with a colour + alpha pair (Pixi). It used to be
    // dropped, and every translucent stroke came out opaque.
    getAlpha()
    {
        if(this.val instanceof Color) { return this.val.getAlpha(); }
        return 1;
    }

    isTransparent()
    {
        if(this.val instanceof Color) { return isColorTransparent(this.val); }
        return false;
    }
}