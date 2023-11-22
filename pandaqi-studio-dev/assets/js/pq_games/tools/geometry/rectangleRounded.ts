import Dims from "./dims"
import Path from "./paths/path"
import roundPath from "./paths/roundPath"
import Point from "./point"
import Rectangle from "./rectangle"
import Shape from "./shape"

interface RectangleRoundedParams
{
    center?:Point
    extents?:Point
    radius?:number,
}

export { RectangleRounded, RectangleRoundedParams }
export default class RectangleRounded extends Rectangle
{
    radius:number

    constructor(r:RectangleRoundedParams = {})
    {
        super(r);
        this.radius = r.radius ?? 1.0;
    }

    clone(deep = false)
    {
        let c = deep ? this.center.clone() : this.center;
        let e = deep ? this.extents.clone() : this.extents;
        return new RectangleRounded({ center: c, extents: e, radius: this.radius });
    }

    toPath()
    {
        return roundPath(super.toPath(), this.radius, true); // @NOTE: third parameter is for CLOSING the path
    }

    toPath2D() 
    {
        const p = new Path2D();
        const dims = this.getDimensions();
        p.roundRect(dims.position.x, dims.position.y, dims.size.x, dims.size.y, this.radius);
        return p;
    }

    toSVG()
    {
        return new Path({ points: this.toPath() }).toSVG();
    }
}