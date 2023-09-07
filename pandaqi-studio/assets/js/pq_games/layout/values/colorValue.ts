import Value from "./value"

type value = string|ColorValue

export default class ColorValue extends Value
{
    value:string

    constructor(col:value = "transparent")
    {
        super();

        var color = col;
        if(col instanceof ColorValue) { color = col.value; }
        this.value = color as string;
    }

    calc() { return this.value; }
    isVisible()
    {
        return this.value != "transparent" // @TODO: and alpha > 0 ?
    }
}