import Random from "../../tools/random/main"
import HSLAToRGBA from "./HSLAToRGBA"
import RGBAToHSLA from "./RGBAToHSLA"
import RGBAToHEXA from "./RGBAToHEXA"
import HEXAToRGBA from "./HEXAToRGBA"

export default class Color 
{
    h:number // 0-360
    s:number // 0-199
    l:number // 0-100
    a:number // 0-1

    constructor(h:number|Color|string, s:number = 0, l:number = 0, a:number = 1.0) {
        if(h == null || h == undefined) { a = 0; h = 0; }
        if(h instanceof Color) { this.fromColor(h); return; }
        if(typeof h === 'string') { this.fromHEXA(h); return; }
        this.fromHSLA(h, s, l, a);
    }

    clone()
    {
        return new Color(this);
    }

    /* The `from` functions */
    fromColor(c:Color)
    {
        this.fromHSLA(c.h, c.s, c.l, c.a);
    }

    fromHEXA(s:string)
    {
        const rgba = HEXAToRGBA(s,null);
        this.fromRGBA(...rgba);
    }

    fromRGBA(r = 0, g = 0, b = 0, a = 255)
    {
        const hsl = RGBAToHSLA(r, g, b, a);
        this.fromHSLA(...hsl);
    }

    fromHSLA(h = 0, s = 0, l = 0, a = 1)
    {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }

    /* The `to` functions */
    toString() : string
    {
        return this.toHSLA();
    }

    toHSLA()
    {
        return "hsla(" + this.h + ", " + this.s + "%, " + this.l + "%, " + this.a + ")"; 
    }

    toHSL()
    {
        return "hsl(" + this.h + ", " + this.s + "%, " + this.l + "%)";
    }

    toRGBA()
    {
        const [r,g,b,a] = HSLAToRGBA(this.h, this.s, this.l, this.a);
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";        
    }

    toRGB()
    {
        const [r,g,b,a] = HSLAToRGBA(this.h, this.s, this.l, this.a);
        return "rgb(" + r + ", " + g + "," + b + ")";
    }

    toHEXA()
    {
        return RGBAToHEXA(...HSLAToRGBA(this.h, this.s, this.l, this.a));
    }

    toHEX()
    {
        return this.toHEXA().slice(0, -2);
    }

    /* Helpers & Tools */
    lighten(dl = 0) : Color
    {
        const newLightness = Math.max(Math.min(this.l + dl, 100), 0);
        return new Color(this.h, this.s, newLightness);
    }

    saturate(ds = 0) : Color
    {
        const newSaturation = Math.max(Math.min(this.s + ds, 100), 0);
        return new Color(this.h, newSaturation, this.l);
    }

    rotate(dh = 0) : Color
    {
        const newHue = (this.h + dh) % 360;
        return new Color(newHue, this.s, this.l);
    }

    randomizeAll(bounds:{min:number,max:number} = { min: -10, max: 10}) : Color
    {
        const min = bounds.min ?? -10;
        const max = bounds.max ?? 10;
        let c = this.clone();
        c = c.lighten(Random.range(min, max));
        c = c.saturate(Random.range(min, max));
        c = c.rotate(Random.range(min, max));
        return c;
    }

    // @TODO
    invert()
    {

    }

    // @TODO
    contrast()
    {

    }


}