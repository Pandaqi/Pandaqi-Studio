import FourSideValue from "./fourSideValue"

enum StrokePlacement {
    INSIDE,
    MIDDLE,
    OUTSIDE
}

enum StrokeType {
    REGULAR,
    DASHED
}

class StrokeValue
{
    color : string
    width : FourSideValue
    placement : StrokePlacement
    type: StrokeType

    constructor(w:number|FourSideValue = 0, c = "transparent", p = StrokePlacement.MIDDLE, t = StrokeType.REGULAR)
    {
        if(!(w instanceof FourSideValue)) { w = new FourSideValue(w); }

        this.width = w;
        this.color = c;
        this.placement = p;
        this.type = t;
    }

    isVisible() : boolean
    {
        return this.color != "transparent" && this.width.isVisible();
    }

    getDimensionMultiplier() : number
    {
        if(this.placement == StrokePlacement.INSIDE) { return 0.0; }
        if(this.placement == StrokePlacement.MIDDLE) { return 0.5; }
        return 1.0;
    }
}

export { StrokeValue, StrokePlacement, StrokeType }
export default StrokeValue