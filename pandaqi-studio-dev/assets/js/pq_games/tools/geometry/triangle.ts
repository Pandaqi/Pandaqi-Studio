import Dims from "./dims";
import Line from "./line";
import Point from "./point"
import Shape from "./shape";

interface TriangleParams
{
    points?:Point[]
}

// @TODO: this class is pretty useless if it just uses a set of points and behaves exactly like a polygon
// Instead, allow setting a base + extension + which direction the (pointy bit of the) triangle points
export { Triangle, TriangleParams }
export default class Triangle extends Shape
{
    points: Point[]

    constructor(t:TriangleParams = {}) 
    {
        super()
        this.points = t.points ?? [];
    }

    clone(deep = false)
    {
        let p = this.points;
        if(deep)
        {
            p = [];
            for(const point of this.points)
            {
                p.push(point.clone());
            }
        }

        return new Triangle({ points: p });
    }

    getDimensions()
    {
        return new Dims().fromPoints(this.toPath());
    }

    toPath()
    {
        return [];
    }

    toSVG()
    {
        const elem = document.createElementNS(null, 'polygon');
        const points = [];
        for(const point of this.points)
        {
            points.push(point.x + "," + point.y);
        }

        const pointsString = points.join(" ");
        elem.setAttribute("points", pointsString);
        return elem;
    }
}