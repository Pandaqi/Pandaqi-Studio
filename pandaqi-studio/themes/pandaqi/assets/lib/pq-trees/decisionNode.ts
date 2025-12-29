export class DecisionNode
{
    label: string;
    text: string;
    paths: Record<string, string>; // branch text, label
    style: Record<string, string>; // property to set, new value

    numInboundPaths:number;

    constructor()
    {
        this.paths = {};
        this.style = {};
    }

    isValid() { return true; }
    finalize() { }

    updatePropertyMultiple(prop:string, vals:string[])
    {
        this[prop][vals[0]] = vals[1];
    }

    updateProperty(prop:string, val:string)
    {
        if(!val || typeof this[prop] === "object") { return; }
        this[prop] = val;
    }
}