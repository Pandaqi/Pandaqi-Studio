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