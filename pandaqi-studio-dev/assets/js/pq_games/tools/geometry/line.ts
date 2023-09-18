import Point from "./point"
import PointGraph from "./pointGraph"
import Shape from "./shape"
import Dims from "./dims"
import { lineIntersectsLineRaw } from "./intersection/lineIntersectsLine"

interface LineDict 
{
    start?:Point
    end?:Point
}

export default class Line extends Shape
{
    start:Point
    end:Point

    constructor(a:Point|PointGraph|Line|LineDict = {}, b:Point|PointGraph = new Point())
    {
        super();

        let start = a;
        let end = b;

        if(a instanceof Line) {
            start = a.start;
            end = a.end;
        } else if(typeof a == "object" && ("start" in a && "end" in a)) {
            start = a.start
            end = a.end;
        }

        this.start = (start as Point) ?? new Point();
        this.end = end ?? new Point();
    }

    toPath() { return [this.start, this.end]; }
    toPath2D() 
    { 
        const p = new Path2D();
        p.moveTo(this.start.x, this.start.y);
        p.lineTo(this.end.x, this.end.y);
        return p;
    }
    toPathString()
    {
        return "M" + this.start.x + "," + this.start.y + " L" + this.end.x + "," + this.end.y;
    }

    toSVG()
    {
        const elem = document.createElementNS(null, 'line');
        elem.setAttribute("x1", this.start.x.toString());
        elem.setAttribute("y1", this.start.y.toString());
        elem.setAttribute("x2", this.end.x.toString());
        elem.setAttribute("y2", this.end.y.toString());
        return elem;
    }

    getDimensions()
    {
        return new Dims().fromLine(this);
    }

    clone(deep = false) 
    {
        let s = deep ? this.start.clone() : this.start;
        let e = deep ? this.end.clone() : this.end;
        return new Line(s, e); 
    }

    // start/end points
    setStart(s: Point) { this.start = s; return this; }
    getStart() { return this.start; }
    setEnd(s: Point) { this.end = s; return this; }
    getEnd() { return this.end; }
    setPoints(start: any, end: any)
    {
        this.setStart(start);
        this.setEnd(end);
        return this;
    }

    // passthrough operations (done on both points)
    // @TODO: also allow the other input methods, such as "x,y" two parameters, only clamp one side, etcetera
    scaleXY(x: number, y: number, anchor = "center") { return this.scale(new Point({ x: x, y: y }), anchor); }
    scaleFactor(f: number, anchor = "center") { return this.scaleXY(f, f, anchor); }
    scale(p: Point, anchor = "center")
    {
        const newVec = this.vector().scale(p);
        if(anchor == "start") { this.end.set(this.start.clone().move(newVec)); }
        else if(anchor == "end") { this.start.set(this.end.clone().move(newVec.negate())); }
        else if(anchor == "center")
        {
            const center = this.center();
            const halfVec = newVec.scaleFactor(0.5);
            this.start.set(center.clone().move(halfVec.clone().negate()));
            this.end.set(center.clone().move(halfVec));
        }
        return this;
    }

    moveXY(x: number, y: number) { return this.move(new Point({ x: x, y: y })); }
    move(p: Point)
    {
        this.start.move(p);
        this.end.move(p);
        return this;
    }

    clamp(pMin: Point, pMax: Point)
    {
        this.start.clamp(pMin, pMax);
        this.end.clamp(pMin, pMax);
        return this;
    }

    // useful properties
    isPoint() { return this.start == this.end || this.length() < 0.00001; }
    vector() { return this.start.vecTo(this.end); }
    length() { return this.start.distTo(this.end); }
    lengthSquared() { return this.start.distSquaredTo(this.end); }
    
    angle()
    {
        const vec = this.vector();
        return Math.atan2(vec.y, vec.x);
    }

    center()
    {
        return this.start.clone().move(this.end).scaleFactor(0.5);
    }

    // geometric tools
    intersectsLine(line:Line, margin = 0.0)
    {
        const vec1 = this.vector().normalize().scaleFactor(margin);
        const vec2 = line.vector().normalize().scaleFactor(margin);
        
        return lineIntersectsLineRaw(
            this.start.x+vec1.x, this.start.y+vec1.y, this.end.x-vec1.x, this.end.y-vec1.y,
            line.start.x+vec2.x, line.start.y+vec2.y, line.end.x-vec2.x, line.end.y-vec2.y
        )
    }
}