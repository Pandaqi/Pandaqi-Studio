import { FourSideOutput } from "js/pq_games/layout/values/fourSideValue"
import Line from "./line"
import Point from "./point"

type GrowParams = { left?:number, right?:number, top?:number, bottom?:number }
type GrowValue = number|FourSideOutput|GrowParams

export default class Dims
{
    position:Point
    size:Point
    topLeft:Point
    bottomRight:Point

    constructor(x:number|Point = 0, y:number|Point = 0, width:number = 0, height:number = 0)
    {
        if(x instanceof Point) {
            this.position = x.clone();
        } else {
            this.position = new Point(x, y as number);
        }

        if(y instanceof Point) {
            this.size = y.clone();
        } else {
            this.size = new Point(width, height);
        }

        this.reset();
    }

    clone()
    {
        return new Dims(this.position.clone(), this.size.clone());
    }

    setPosition(p:Point)
    {
        this.position = p.clone();
    }

    getPosition() : Point
    {
        return this.position.clone();
    }

    setSize(p: Point)
    {
        this.size = p.clone();
    }

    getSize() : Point
    {
        return this.size.clone();
    }

    setCorners(topLeft:Point, bottomRight:Point)
    {
        this.topLeft = topLeft
        this.bottomRight = bottomRight;
        this.refresh();
    }

    fromLine(l:Line)
    {
        this.reset();
        this.takePointIntoAccount(l.start);
        this.takePointIntoAccount(l.end);
        return this;
    }

    fromPoints(points:Point[])
    {
        this.reset();
        for(const point of points)
        {
            this.takePointIntoAccount(point);
        }
        return this;
    }

    fromDims(d:Dims) : Dims
    {
        this.setPosition(d.position.clone());
        this.setSize(d.size.clone());
        return this;
    }

    toPath2D() : Path2D
    {
        const p = new Path2D();
        p.moveTo(this.position.x, this.position.y);
        p.lineTo(this.position.x+this.size.x, this.position.y);
        p.lineTo(this.position.x+this.size.x, this.position.y+this.size.y);
        p.lineTo(this.position.x, this.position.y+this.size.y);
        p.lineTo(this.position.x, this.position.y);
        return p;
    }

    takePointIntoAccount(p:Point)
    {
        const d = new Dims(p, new Point());
        this.takeIntoAccount(d);
    }

    takeIntoAccount(d:Dims)
    {
        this.topLeft.x = Math.min(this.topLeft.x, d.position.x);
        this.topLeft.y = Math.min(this.topLeft.y, d.position.y);
        this.bottomRight.x = Math.max(this.bottomRight.x, d.position.x + d.size.x);
        this.bottomRight.y = Math.max(this.bottomRight.y, d.position.y + d.size.y);
        this.refresh();
    }

    grow(v:GrowValue)
    {
        if(typeof v !== "object")
        {
            v = { left: v, right: v, top: v, bottom: v };
        }

        this.topLeft.x -= v.left;
        this.topLeft.y -= v.top;
        this.bottomRight.x += v.right;
        this.bottomRight.y += v.bottom;
        this.refresh();
    }

    reset()
    {
        this.topLeft = new Point().setXY(Infinity, Infinity);
        this.bottomRight = new Point().setXY(-Infinity, -Infinity);
    }

    refresh()
    {
        this.position = this.topLeft.clone();
        this.size = this.bottomRight.clone().sub(this.topLeft.clone());
    }

    merge(d1:Dims, d2:Dims)
    {
        this.position = new Point(
            d1.position.x ?? d2.position.x,
            d1.position.y ?? d2.position.y
        )

        this.size = new Point(
            d1.size.x ?? d2.size.x, 
            d1.size.y ?? d2.size.y
        )
    }

    move(p:Point)
    {
        this.position.move(p);
        return this;
    }
}