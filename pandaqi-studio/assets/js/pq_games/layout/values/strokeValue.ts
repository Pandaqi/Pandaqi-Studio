import Value from "./value"
import { FourSideValue, FourSideOutput } from "./fourSideValue"
import ColorValue from "./colorValue"
import Point from "js/pq_games/tools/geometry/point"

enum StrokePlacement {
    INSIDE,
    MIDDLE,
    OUTSIDE
}

enum StrokeType {
    REGULAR,
    DASHED
}

interface StrokeOutput
{
    width: FourSideOutput,
    color: string,
    placement: StrokePlacement,
    type: StrokeType
}

type valueWidth = number|FourSideValue
type valueColor = string|ColorValue

interface dict {
    width: number|FourSideValue,
    color: string|ColorValue,
    placement?: StrokePlacement,
    type?: StrokeType
}

class StrokeValue extends Value
{
    width : FourSideValue
    color : ColorValue
    placement : StrokePlacement
    type: StrokeType

    constructor(w:valueWidth|dict|StrokeValue = 0, c:valueColor = "transparent", p = StrokePlacement.MIDDLE, t = StrokeType.REGULAR)
    {
        super();

        let width = w;
        let color = c;
        let placement = p;
        let type = t;

        if(w instanceof StrokeValue) 
        { 
            width = w.width;
            color = w.color;
            placement = w.placement;
            type = w.type;
        }

        if(w && typeof w == "object" && ("width" in w && "color" in w))
        {
            width = w.width;
            color = w.color;
            placement = w.placement ?? StrokePlacement.MIDDLE;
            type = w.type ?? StrokeType.REGULAR
        }

        this.width = new FourSideValue(width as valueWidth);
        this.color = new ColorValue(color);
        this.placement = placement;
        this.type = type;
    }
    
    getStyleAsCSSProp() : string
    {
        if(this.type == StrokeType.REGULAR) { return "solid"; }
        else if(this.type == StrokeType.DASHED) { return "dashed"; }
    }

    isVisible() : boolean
    {
        return this.color.isVisible() && this.width.isVisible();
    }

    getDimensionMultiplier() : number
    {
        if(this.placement == StrokePlacement.INSIDE) { return 0.0; }
        if(this.placement == StrokePlacement.MIDDLE) { return 0.5; }
        return 1.0;
    }

    calc(parentSize : Point, contentSize = new Point().setXY(null,null)) : StrokeOutput
    {
        return {
            width: this.width.calc(parentSize, contentSize),
            color: this.color.calc(),
            placement: this.placement,
            type: this.type
        }
    }

    dependsOnContent() : boolean
    {
        return this.width.dependsOnContent();
    }
}

export { StrokeValue, StrokePlacement, StrokeType, StrokeOutput }
export default StrokeValue