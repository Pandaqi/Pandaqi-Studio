import Dims from "./dims";
import Path from "./paths/path";
import Point from "./point";
import Shape from "./shape";

interface PolygonParams
{
    center?:Point
    radius?:number
    corners?:number
}

export { Polygon, PolygonParams }
export default class Polygon extends Shape
{
    center:Point
    radius:number
    corners:number

    constructor(h:PolygonParams = {})
    {
        super()
        this.center = h.center ?? new Point();
        this.radius = h.radius ?? 0.5;
        this.corners = h.corners ?? 6;
    }

    getDimensions()
    {
        return new Dims().fromPoints(this.toPath());
    }

    toPath()
    {
        const path = [];
        const num = this.corners;
        for(let i = 0; i < num; i++)
        {
            const ang = i * (2*Math.PI) / num;
            const point = new Point(
                this.center.x + Math.cos(ang) * this.radius,
                this.center.y + Math.sin(ang) * this.radius
            )
            path.push(point);
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
        const elem = document.createElementNS(null, 'polygon');
        const points = [];
        for(const point of this.toPath())
        {
            points.push(point.x + "," + point.y);
        }

        const pointsString = points.join(" ");
        elem.setAttribute("points", pointsString);
        return elem;
    }
}