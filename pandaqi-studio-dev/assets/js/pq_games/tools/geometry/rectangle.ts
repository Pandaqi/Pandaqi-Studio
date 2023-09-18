import Dims from "./dims"
import Path from "./paths/path"
import Point from "./point"
import Shape from "./shape"

interface RectangleParams
{
    center?:Point
    extents?:Point // the FULL size of the rectangle (multiplied by 0.5 to center it)
}

export { Rectangle, RectangleParams }
export default class Rectangle extends Shape
{
    center:Point
    extents:Point

    constructor(r:RectangleParams = {})
    {
        super();
        this.center = r.center ?? new Point();
        this.extents = r.extents ?? new Point();
    }

    clone(deep = false)
    {
        let c = deep ? this.center.clone() : this.center;
        let e = deep ? this.extents.clone() : this.extents;
        return new Rectangle({ center: c, extents: e });
    }

    getDimensions()
    {
        return new Dims(
            this.getTopLeft(),
            this.extents.clone()
        );
    }

    toPath()
    {
        return [
            this.getTopLeft(),
            this.getTopRight(),
            this.getBottomRight(),
            this.getBottomLeft()
        ]
    }

    toPath2D() 
    {
        const p = new Path2D();
        const dims = this.getDimensions();
        p.rect(dims.position.x, dims.position.y, dims.size.x, dims.size.y);
        return p;
    }

    toPathString()
    {
        return new Path({ points: this.toPath() }).toPathString();
    }

    toSVG()
    {
        const elem = document.createElementNS(null, 'rect');
        const topLeft = this.getTopLeft();
        elem.setAttribute("x", topLeft.x.toString());
        elem.setAttribute("y", topLeft.y.toString());
        elem.setAttribute("width", this.extents.x.toString());
        elem.setAttribute("height", this.extents.y.toString());
        return elem;
    }

    getPositionWithOffset(off:Point) : Point
    {
        const offset = this.extents.clone().scale(off).scaleFactor(0.5);
        return this.center.clone().add(offset);
    }

    getTopLeft()
    {
        return this.getPositionWithOffset(new Point(-1,-1));
    }
    
    getTopRight()
    {
        return this.getPositionWithOffset(new Point(1,-1));
    }

    getBottomRight()
    {
        return this.getPositionWithOffset(new Point(1,1));
    }

    getBottomLeft()
    {
        return this.getPositionWithOffset(new Point(-1,1));
    }
}