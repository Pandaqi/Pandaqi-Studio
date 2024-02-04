import Dims from "./dims";
import Path from "./paths/path";
import Point from "./point"
import Shape from "./shape";

interface PieParams
{
    center?:Point
    radius?:number
    startAngle?: number
    endAngle?: number
}

export { Pie, PieParams }
export default class Pie extends Shape
{
    center:Point
    radius:number
    startAngle:number
    endAngle:number

    constructor(c:PieParams = {})
    {
        super();
        this.center = c.center ?? new Point();
        this.radius = c.radius ?? 0.5;
        this.startAngle = c.startAngle ?? 0;
        this.endAngle = c.endAngle ?? 0.5*Math.PI;
    }

    clone(deep = false)
    {
        let c = deep ? this.center.clone() : this.center;
        return new Pie({ center: c, radius: this.radius, startAngle: this.startAngle, endAngle: this.endAngle });
    }

    getDimensions()
    {
        return new Dims(
            this.center.clone().sub(new Point(this.radius)),
            new Point(this.radius*2)
        );
    }

    toPath2D() 
    {
        const p = new Path2D();
        p.moveTo(this.center.x, this.center.y);
        p.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, false);
        p.lineTo(this.center.x, this.center.y);
        return p;
    }
    
    toPathString()
    {
        return new Path({ points: this.toPath() }).toPathString();
    }

    // @TODO: toSVG()
    // @TODO: toPath()
}