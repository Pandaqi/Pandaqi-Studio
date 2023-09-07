import Resource from "./resource"

export default class ResourceFont extends Resource
{
    fontface : FontFace;

    constructor(f: FontFace, params:any = {})
    {
        super()

        this.fontface = f;
    }
    
    clone() : ResourceFont
    {
        var res = new ResourceFont(this.fontface, this);
        return res;
    }
    
}