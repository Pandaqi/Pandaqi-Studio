import Value from "./value"

type value = string|ColorValue

export default class ColorValue extends Value
{
    value:string

    // @TODO: properly allow modifying the color, reading RGBA, representing differently, lighten/darken, etcetera
    constructor(col:value = "transparent")
    {
        super();

        let color = col;
        if(col instanceof ColorValue) { color = col.value; }
        this.value = color as string;
    }

    toCSS() { return this.get(); }
    get() { return this.value; }
    calc() { return this.get(); }
    isVisible()
    {
        return this.value != "transparent" // @TODO: and alpha > 0 ?
    }
}