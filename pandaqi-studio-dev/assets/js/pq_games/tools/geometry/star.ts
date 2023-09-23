import Dims from "./dims";
import Path from "./paths/path";
import Point from "./point";
import Shape from "./shape";

interface StarParams
{
    center?:Point
    radiusOutside?:number
    radiusInside?:number
    corners?:number
}

export { Polygon, StarParams }
export default class Polygon extends Shape
{
    center:Point
    radiusInside:number
    radiusOutside:number
    corners:number

    constructor(h:StarParams = {})
    {
        super()
        this.center = h.center ?? new Point();
        this.radiusInside = h.radiusInside ?? 10;
        this.radiusOutside = h.radiusOutside ?? 20;
        this.corners = h.corners ?? 5;
    }

    getDimensions()
    {
        return new Dims().fromPoints(this.toPath());
    }

    toPath()
    {
        const path = [];
        const num = this.corners*2;
        for(let i = 0; i < num; i++)
        {
            const outerCorner = (i % 2 == 0);
            const radius = outerCorner ? this.radiusOutside : this.radiusInside;

            const ang = i * (2*Math.PI) / num;
            const point = new Point(
                this.center.x + Math.cos(ang) * radius,
                this.center.y + Math.sin(ang) * radius
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