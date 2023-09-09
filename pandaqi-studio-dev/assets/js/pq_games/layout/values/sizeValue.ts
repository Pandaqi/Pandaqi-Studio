import Value from "./value"

enum SizeType {
    FIXED,
    PARENT,
    CONTENT
}

type value = number|SizeValue
interface dict {
    value: number,
    type?: SizeType
}

export { SizeValue, SizeType }
export default class SizeValue extends Value
{

    value:number
    type:SizeType

    constructor(v:value|dict = 0, t:SizeType = SizeType.FIXED)
    {
        super()

        let value = v;
        let type = t;

        if(v instanceof SizeValue)
        {
            value = v.value;
            type = v.type;
        } 
        else if(v && typeof v == "object" && ("value" in v))
        {
            value = v.value ?? 0;
            type = v.type ?? SizeType.FIXED;
        }

        this.value = (value as number) ?? 0;
        this.type = type;

        // @TODO: default to content growth if value negative?? if(v < 0) { v = 0; t = SizeType.CONTENT; }
    }

    isVariable() : boolean
    {
        return this.type == SizeType.CONTENT || this.type == SizeType.PARENT;
    }

    dependsOnContent() : boolean
    {
        return this.type == SizeType.CONTENT
    }
    
    get() : number
    {
        return this.value;
    }

    calcs(parentSize : number, contentSize : number = null) : number
    {
        if(this.type == SizeType.CONTENT)
        {
            
            if(!contentSize) { return null; }
            return this.value * contentSize; 
        } 
        else if(this.type == SizeType.PARENT)
        {
            return this.value * parentSize;
        }

        return this.value;
    }
}