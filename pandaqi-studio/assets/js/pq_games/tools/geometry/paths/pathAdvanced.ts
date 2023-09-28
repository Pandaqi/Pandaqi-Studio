import Point from "../point";
import PointPath, { PathCommand } from "./pointPath";
import Shape from "../shape";
import ArcData from "./arcData";
import Dims from "../dims";
import fromArray from "../../random/fromArray";

interface PathAdvancedParams
{
    points?: Point[]|PointPath[]
    close?: boolean
}

export { PathAdvanced, PathAdvancedParams }
export default class PathAdvanced extends Shape
{
    points: PointPath[]
    close: boolean

    constructor(p:PathAdvancedParams = {})
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

    toPath2D() : Path2D
    {
        const path = new Path2D();
        for(const pointPath of this.points)
        {
            pointPath.toPath2D(path);
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
                p.push(point.clone(deep));
            }
        }

        return new PathAdvanced({ points: p, close: this.close });
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
        const svgNS = "http://www.w3.org/2000/svg";
        const elem = document.createElementNS(svgNS, 'path');
        elem.setAttribute("d", this.toPathString());
        return elem;
    }

    reverse()
    {
        this.points.reverse();
        return this;
    }

    getFirst() { return this.points[0].point; }
    getLast() { return this.points[this.points.length-1].point; }
    hasPoint(p) 
    { 
        for(const point of this.points)
        {
            if(point.point == p || point.point.matches(p)) { return true; }
        }
        return false;
    }
    getRandomPoint()
    {
        return fromArray(this.points).point;
    }
    endPointsMatch(p1:Point, p2:Point)
    {
        const first = this.getFirst();
        const last = this.getLast();
        if(first.matches(p1) && last.matches(p2)) { return true; }
        if(first.matches(p2) && last.matches(p1)) { return true; }
        return false;
    }
}