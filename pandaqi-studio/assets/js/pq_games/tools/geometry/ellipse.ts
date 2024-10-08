import Dims from "./dims";
import Path from "./paths/path";
import Point from "./point"
import Shape from "./shape";

interface EllipseParams
{
    center?:Point
    radius?:Point
}

export { Ellipse, EllipseParams }
export default class Ellipse extends Shape
{
    center:Point
    radius:Point

    constructor(c:EllipseParams = {})
    {
        super();
        this.center = c.center ?? new Point();
        this.radius = c.radius ?? new Point(10);
    }

    clone(deep = false)
    {
        let c = deep ? this.center.clone() : this.center;
        let r = deep ? this.radius.clone() : this.radius;
        return new Ellipse({ center: c, radius: r });
    }

    getDimensions()
    {
        return new Dims(
            this.center.clone().sub(this.radius),
            this.radius.clone().scaleFactor(2.0)
        );
    }

    createPixiObject(graphicsConstructor)
    {
        return new graphicsConstructor({}).ellipse(this.center.x, this.center.y, this.radius.x, this.radius.y);
    }

    toPath(resolution = 32)
    {
        const path : Point[] = [];
        for(let i = 0; i < resolution; i++)
        {
            const angle = i * (2*Math.PI) / resolution;
            const pos = new Point(
                this.center.x + Math.cos(angle)*this.radius.x,
                this.center.y + Math.sin(angle)*this.radius.y
            )
        }
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
        const elem = document.createElementNS(null, 'ellipse');
        elem.setAttribute("cx", this.center.x.toString());
        elem.setAttribute("cy", this.center.y.toString());
        elem.setAttribute("rx", this.radius.x.toString());
        elem.setAttribute("ry", this.radius.y.toString());
        return elem;
    }
}