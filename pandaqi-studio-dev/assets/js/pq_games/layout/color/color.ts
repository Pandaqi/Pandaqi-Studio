import Random from "../../tools/random/main"
import HSLAToRGBA from "./HSLAToRGBA"
import RGBAToHSLA from "./RGBAToHSLA"
import RGBAToHEXA from "./RGBAToHEXA"
import HEXAToRGBA from "./HEXAToRGBA"
import isZero from "js/pq_games/tools/numbers/isZero"
import lerp from "js/pq_games/tools/numbers/lerp"
import slerp from "js/pq_games/tools/numbers/slerp"

export default class Color 
{
    h:number // 0-360
    s:number // 0-199
    l:number // 0-100
    a:number // 0-1

    static BLACK = new Color("#000000")
    static WHITE = new Color("#FFFFFF")
    static TRANSPARENT = new Color("transparent")

    constructor(h:number|Color|string = null, s:number = 0, l:number = 0, a:number = 1.0) 
    {
        if(h == null || h == undefined) { a = 0; h = 0; }
        if(h == "transparent") { this.fromHSLA(0,0,0,0); return; } // @TODO: better support with function/static for "transparent"
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
        return this;
    }

    fromHEXNumber(n:number)
    {
        // @TODO: how to do this??
        return this;
    }

    fromHEXA(s:string)
    {
        const rgba = HEXAToRGBA(s,null);
        this.fromRGBA(...rgba);
        return this;
    }

    fromRGBA(r = 0, g = 0, b = 0, a = 255)
    {
        const hsl = RGBAToHSLA(r, g, b, a);
        this.fromHSLA(...hsl);
        return this;
    }

    fromHSLA(h = 0, s = 0, l = 0, a = 1)
    {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
        return this;
    }

    /* The `to` functions */
    toCSS() { return this.toString(); }

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

    toRGBRaw()
    {
        return HSLAToRGBA(this.h, this.s, this.l, this.a);
    }

    toRGB()
    {
        const [r,g,b,a] = this.toRGBRaw();
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

    toHEXNumber()
    {
        const hex = this.toHEX();
        return parseInt(hex.replace("#", "0x"));
    }

    /* Helpers & Tools */
    lighten(dl = 0) : Color
    {
        const newLightness = Math.max(Math.min(this.l + dl, 100), 0);
        return new Color(this.h, this.s, newLightness);
    }

    darken(dl = 0) : Color
    {
        return this.lighten(-dl);
    }

    saturate(ds = 0) : Color
    {
        const newSaturation = Math.max(Math.min(this.s + ds, 100), 0);
        return new Color(this.h, newSaturation, this.l);
    }

    rotate(dh = 0) : Color
    {
        const newHue = (this.h + dh + 360) % 360;
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

    getBestContrast()
    {
        if(this.getLuminosity() >= 165) { return Color.BLACK; }
        return Color.WHITE;
    }

    // @SOURCE: https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
    getLuminosity()
    {
        const rgba = HSLAToRGBA(this.h, this.s, this.l, this.a); // get RGBA
        const gamma = 2.4; // linearize it for sRGB
        var a = rgba.map((v) => {
            v /= 255;
            return v <= 0.04045
              ? v / 12.92
              : Math.pow((v + 0.055) / 1.055, gamma);
        });
        // mix in correct proportions
        return (0.2126 * a[0]) + (0.7152 * a[1]) + (0.0722 * a[2]); // SMPTE C, Rec. 709 weightings
    }

    getContrastWith(c:Color)
    {
        const lum1 = this.getLuminosity();
        const lum2 = c.getLuminosity();
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    getHighestContrast(colors:Color[])
    {
        let bestRatio = 0;
        let bestColor = null;
        for(const color of colors)
        {
            const ratio = this.getContrastWith(color);
            if(ratio <= bestRatio) { continue; }
            bestRatio = ratio;
            bestColor = color;
        }
        return bestColor;
    }

    isTransparent()
    {
        return isZero(this.a);
    }

    // @TODO
    invert()
    {

    }

    mix(c:Color, factor = 0.5)
    {
        const hue = slerp(this.h, c.h, factor, 360);
        const l = lerp(this.l, c.l, factor);
        const s = lerp(this.s, c.s, factor);
        return new Color(hue, s, l);
    }
}