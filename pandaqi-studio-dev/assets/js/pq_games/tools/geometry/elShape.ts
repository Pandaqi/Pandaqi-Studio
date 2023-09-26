import Dims from "./dims";
import Path from "./paths/path";
import Point from "./point";
import Shape from "./shape";

interface LShapeParams
{
    center?:Point
    extents?:Point
    extentsHole?:Point
}

export { LShape, LShapeParams }
export default class LShape extends Shape
{
    center:Point
    extents:Point
    extentsHole:Point

    constructor(h:LShapeParams = {})
    {
        super()
        this.center = h.center ?? new Point();
        this.extents = h.extents ?? new Point(1,1);
        this.extentsHole = h.extentsHole ?? new Point(0.5, 0.5);
    }

    getDimensions()
    {
        return new Dims().fromPoints(this.toPath());
    }

    toPath()
    {
        const topLeft = this.center.clone().add(this.extents.clone().scaleFactor(-0.5));
        const topRight = this.center.clone().add(new Point(0.5*this.extents.x, -0.5*this.extents.y));
        const bottomRight = this.center.clone().add(this.extents);
        const bottomLeft = this.center.clone().add(new Point(-0.5*this.extents.x, 0.5*this.extents.y));

        const path = [
            topLeft,
            topRight.clone().sub(new Point(this.extentsHole.x, 0)),
            topRight.clone().sub(this.extentsHole),
            topRight.clone().add(new Point(0, this.extentsHole.y)),
            bottomRight,
            bottomLeft
        ];
        
        return path;
    }

    toPath2D()
    {
        return new Path({ points: this.toPath() }).toPath2D();
    }

    toPathString()
    {
        return new Path({ points: this.toPath() }).toPathString();
    }

    toSVG()
    {
        return new Path({ points: this.toPath() }).toSVG();
    }
}