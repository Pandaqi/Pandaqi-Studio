import Point from "../point";
import Shape from "../shape";
import Dims from "../dims";

interface PathParams
{
    points?: Point[]
    close?: boolean
}

export { Path, PathParams }
export default class Path extends Shape
{
    points: Point[]
    close: boolean

    constructor(p:PathParams = {})
    {
        super();
        this.points = p.points ?? [];
        this.close = p.close ?? false;
    }

    toPath() : Point[] 
    { 
        const points = this.points.slice();
        if(this.close) { points.push(points[0]); }
        return points;
    }

    toPath2D() : Path2D
    {
        const path = new Path2D();
        for(const point of this.toPath())
        {
            path.lineTo(point.x, point.y);
        }
        return path;
    }

    getDimensions()
    {
        return new Dims().fromPoints(this.toPath());
    }

    clone(deep = false)
    {
        let p = this.points.slice();
        if(deep)
        {
            p = [];
            for(const point of this.points)
            {
                p.push(point.clone());
            }
        }

        return new Path({ points: p, close: this.close });
    }

    toPathString() : string
    {
        const points = [];
        for(let i = 0; i < this.points.length; i++)
        {
            let prefix = (i == 0) ? "M" : "L";
            let point = this.points[i].x + "," + this.points[i].y;
            points.push(prefix + point);
        }
        if(this.close) { points.push("Z"); }
        const pointsString = points.join(" ");
        return pointsString;
    }

    toSVG()
    {
        const svgNS = "http://www.w3.org/2000/svg"; // @TODO: declare this ONCE somewhere and re-use?
        const elem = document.createElementNS(svgNS, 'path');
        elem.setAttribute("d", this.toPathString());
        return elem;
    }

    reverse()
    {
        this.points.reverse();
        return this;
    }

    getFirst() { return this.points[0]; }
    getLast() { return this.points[this.points.length-1]; }
}