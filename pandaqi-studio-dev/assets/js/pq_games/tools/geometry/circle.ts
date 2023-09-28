import Dims from "./dims";
import Path from "./paths/path";
import Point from "./point"
import Shape from "./shape";

interface CircleParams
{
    center?:Point
    radius?:number
}

export { Circle, CircleParams }
export default class Circle extends Shape
{
    center:Point
    radius:number

    constructor(c:CircleParams = {})
    {
        super();
        this.center = c.center ?? new Point();
        this.radius = c.radius ?? 0.5;
    }

    clone(deep = false)
    {
        let c = deep ? this.center.clone() : this.center;
        return new Circle({ center: c, radius: this.radius });
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
        p.arc(this.center.x, this.center.y, this.radius, 0, 2*Math.PI);
        return p;
    }

    toPath(resolution = 32)
    {
        const path : Point[] = [];
        for(let i = 0; i < resolution; i++)
        {
            const angle = i * (2*Math.PI) / resolution;
            const pos = new Point(
                this.center.x + Math.cos(angle)*this.radius,
                this.center.y + Math.sin(angle)*this.radius
            )
            path.push(pos);
        }
        return path;
    }

    toPathString()
    {
        return new Path({ points: this.toPath() }).toPathString();
    }

    toSVG()
    {
        const elem = document.createElementNS(null, 'circle');
        elem.setAttribute("cx", this.center.x.toString());
        elem.setAttribute("cy", this.center.y.toString());
        elem.setAttribute("r", this.radius.toString());
        return elem;
    }
}