import ColorStop from "../color/colorStop";
import Resource from "./resource"

enum GradientType
{
    LINEAR,
    RADIAL,
    CONIC
}

interface ResourceGradientParams
{
    type?:GradientType,
    stops?:ColorStop[]
}

export { ResourceGradient, GradientType }
export default class ResourceGradient extends Resource
{
    stops: ColorStop[];
    type: GradientType
    // @TODO: some third parameters for direction (if linear) or size/keep circular (if elliptical)

    constructor(params:ResourceGradientParams = {})
    {
        super()

        this.type = params.type ?? GradientType.LINEAR;
        this.stops = params.stops ?? [];
    }
    
    clone(deep = false) : ResourceGradient
    {
        let stops = this.stops;
        if(deep)
        {
            stops = [];
            for(const stop of this.stops)
            {
                stops.push(stop.clone(deep));
            }
        }
        
        return new ResourceGradient({ type: this.type, stops: stops });
    }

    addStop(s:ColorStop)
    {
        this.stops.push(s);
    }

    removeStop(s:ColorStop)
    {
        const idx = this.stops.indexOf(s);
        if(idx < 0) { return; }
        this.stops.splice(idx, 1);
    }
    
}