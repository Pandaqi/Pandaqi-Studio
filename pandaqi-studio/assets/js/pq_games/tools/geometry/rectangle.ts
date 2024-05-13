import Bounds from "../numbers/bounds"
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
        this.extents = r.extents ?? new Point(1,1);
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

    toSVG() : SVGElement|HTMLElement
    {
        const elem = document.createElementNS(null, 'rect');
        const topLeft = this.getTopLeft();
        elem.setAttribute("x", topLeft.x.toString());
        elem.setAttribute("y", topLeft.y.toString());
        elem.setAttribute("width", this.extents.x.toString());
        elem.setAttribute("height", this.extents.y.toString());
        return elem;
    }

    // @TODO: should really just think about how I generally want to handle pivoting/rotation for all shapes, in a much smarter and more general way
    rotateFromPivot(pivot: Point, rotation:number)
    {
        const rot = rotation % 4;
        const newExtents = this.extents.clone();
        const rotRadians = rot * 0.5 * Math.PI;
        if(rot == 1 || rot == 3) 
        { 
            newExtents.rotate(rotRadians); 
            newExtents.abs();
        }

        // move coordinate system to (0,0)
        const pivotNorm = pivot.sub(new Point(0.5));
        const pivotPos = this.center.clone().add(pivotNorm.clone().scale(this.extents));
        const offsetVec = this.center.clone().sub(pivotPos);

        // rotate
        offsetVec.rotate(rotRadians);

        // move back to original position
        const newCenter = offsetVec.add(pivotPos);

        this.extents = newExtents;
        this.center = newCenter;
        return this;
    }

    fromTopLeft(pos:Point, size:Point)
    {
        this.center = pos.clone().add(size.clone().scaleFactor(0.5));
        this.extents = size.clone();
        return this;
    }


    fromBottomRight(pos:Point, size:Point)
    {
        this.center = pos.clone().sub(size.clone().scaleFactor(0.5));
        this.extents = size.clone();
        return this;
    }

    getPositionWithOffset(off:Point) : Point
    {
        const offset = this.extents.clone().scale(off).scaleFactor(0.5);
        return this.center.clone().add(offset);
    }

    getCenter()
    {
        return this.center.clone();
    }

    getSize()
    {
        return this.extents.clone();
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

    grow(ds:number|Point)
    {
        this.extents.add(new Point(ds).scale(2));
        return this;
    }

    shrink(ds:number|Point)
    {
        ds = new Point(ds);
        return this.grow(ds.clone().negate());
    }

    move(dm:number|Point)
    {
        this.center.move(new Point(dm));
        return this;
    }

    scaleCenter(s:number|Point)
    {
        this.center.scale(s);
        return this;
    }

    scale(s:number|Point)
    {
        this.extents.scale(s);
        return this;
    }

    getRandomPositionInside()
    {
        const x = this.center.x + new Bounds(-1,1).random() * 0.5 * this.extents.x;
        const y = this.center.y + new Bounds(-1,1).random() * 0.5 * this.extents.y;
        return new Point(x,y);
    }
}