import Random from "../../tools/random/main"

export default class Color 
{
    h:number
    s:number
    l:number
    a:number

    constructor(h:number|Color|string = 0, s:number = 0, l:number = 0, a:number = 1.0) {
        if(h instanceof Color) { this.fromColor(h); return; }
        if(isNaN(h)) { this.fromString(h); return; }
        this.fromHSLA(h, s, l, a);
    }

    clone()
    {
        return new Color(this.h, this.s, this.l);
    }

    /* The `from` functions */
    fromColor(c:Color)
    {
        this.fromHSLA(c.h, c.s, c.l, c.a);
    }

    fromString(s:string)
    {
        // @TODO: all of this conversion mumbo-jumbo
    }

    fromRGBA(r = 0, g = 0, b = 0, a = 1)
    {

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
        return "hsl(" + this.h + ", " + this.s + "%, " + this.l + "%)"; 
    }

    toHex()
    {
        let l = this.l, s = this.s, h = this.h;

        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n:number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        
        return `#${f(0)}${f(8)}${f(4)}`;
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


}