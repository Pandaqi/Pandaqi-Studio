import Value from "./value"

export default class NumberValue extends Value
{
    value:number;

    constructor(v:number|NumberValue = 0)
    {
        super();
        if(v instanceof NumberValue) { this.value = v.value ?? 0; }
        else { this.value = v ?? 0; }
    }

    toCSS() : string { return this.get().toString(); }
    get() : number { return this.value; }
    calc(parentDims = null) : number { return this.value; }
}