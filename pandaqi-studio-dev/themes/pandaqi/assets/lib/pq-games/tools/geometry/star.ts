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
    rotation?:number
}

export { Star, StarParams }
export default class Star extends Shape
{
    center:Point
    radiusInside:number
    radiusOutside:number
    corners:number
    rotation:number

    constructor(h:StarParams = {})
    {
        super()
        this.center = h.center ?? new Point();
        this.radiusInside = h.radiusInside ?? 0.25;
        this.radiusOutside = h.radiusOutside ?? 0.5;
        this.corners = h.corners ?? 5;
        this.rotation = h.rotation ?? 0;
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

            const ang = this.rotation + i * (2*Math.PI) / num;
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
        return new Path({ points: this.toPath() }).toSVG();
    }
}