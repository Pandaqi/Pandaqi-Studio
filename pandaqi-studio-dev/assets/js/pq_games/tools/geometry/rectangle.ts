import Point from "./point"
import Shape from "./shape"

interface RectangleParams
{
    center?:Point
    extents?:Point
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

    toPath()
    {
        return [
            this.getTopLeft(),
            this.getTopRight(),
            this.getBottomRight(),
            this.getBottomLeft()
        ]
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