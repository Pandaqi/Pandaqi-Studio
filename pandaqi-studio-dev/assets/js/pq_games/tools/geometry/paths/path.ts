import Point from "../point";
import PointPath, { PathCommand } from "./pointPath";
import Shape from "../shape";
import ArcData from "./arcData";

interface PathParams
{
    points?: Point[]
    close?: boolean
}

// @TODO: All other functions could just use this? They all come down to paths, and this one handles it all
export { Path, PathParams }
export default class Path extends Shape
{
    points: PointPath[]
    close: boolean

    constructor(p:PathParams = {})
    {
        super();
        let points = p.points ?? [];
        this.points = this.convertToPathPoints(points);
        this.close = p.close ?? false;
    }

    convertToPathPoints(points:any[]) : PointPath[]
    {
        if(points.length <= 0) { return points; }
        if(points[0] instanceof PointPath) { return points; }
        const arr = [];
        for(let i = 0; i < points.length; i++)
        {
            const command = (i == 0) ? PathCommand.START : PathCommand.LINE; 
            const p = new PointPath({ point: points[i], command: command });
            arr.push(p);
        }
        return arr;
    }

    startAt(p:Point)
    {
        this.points.push(new PointPath({point: p, command: PathCommand.START}));
    }

    lineTo(p:Point)
    {
        this.points.push(new PointPath({point: p, command: PathCommand.LINE}));
    }

    curveTo(p:Point, c1:Point, c2:Point)
    {
        let cmd = c2 ? PathCommand.CUBIC : PathCommand.QUAD;
        this.points.push(new PointPath({point: p, command: cmd, controlPoint1: c1, controlPoint2: c2 }));
    }

    arcTo(p:Point, d:ArcData)
    {
        this.points.push(new PointPath({ point: p, command: PathCommand.ARC, arcData: d }));
    }

    // @TODO: need my own functions to handle arcs/bezier/etcetera => put those in a paths subfolder for geometry?
    toPath() : Point[]
    {
        const points = [];
        let prevPoint = null;
        for(const pointPath of this.points)
        {
            points.push(pointPath.toPath(prevPoint));
            prevPoint = pointPath.getPointAbsolute(prevPoint);
        }
        if(this.close && this.points.length > 0) { points.push(this.points[0].point); }
        return points.flat();
    }

    toPathString() : string
    {
        const points = [];
        for(const pointPath of this.points)
        {
            points.push(pointPath.toPathString());
        }
        if(this.close) { points.push("Z"); }
        const pointsString = points.join(" ");
        return pointsString;
    }

    toSVG()
    {
        const elem = document.createElementNS(null, 'path');
        elem.setAttribute("d", this.toPathString());
        return elem;
    }
}