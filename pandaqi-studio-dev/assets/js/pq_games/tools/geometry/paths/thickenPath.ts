import { getLineIntersectionFromVectors } from "../intersection/getLineIntersection";
import { lineIntersectsLine } from "../intersection/lineIntersectsLine";
import Line from "../line";
import Point from "../point";
import Shape, { PathLike } from "../shape";
import Path from "./path";

interface ThickenPathParams
{
    path: PathLike,
    thickness?: number
}

export default (params:ThickenPathParams) =>
{
    let points = params.path;
    if(points instanceof Shape) { points = points.toPath(); }

    const thickness = params.thickness ?? 10;

    let lastVec : Point = new Point();
    let lastLines = [new Line(), new Line()];
    const extrudes = [[], []];
    const signs = [1,-1];
    for(let i = 0; i < points.length; i++)
    {
        const lastPoint = i >= (points.length - 1);
        let vec = lastVec.clone();

        const p1 = points[i];
        if(!lastPoint)
        {
            const p2 = points[i+1];
            vec = p1.vecTo(p2).normalize();
        }
        
        lastVec = vec.clone();

        // @TODO: should really fix the double points in smoothPath as well
        if(vec.isZero()) { continue; }

        for(let a = 0; a < 2; a++)
        {
            const vecOffset = vec.clone().rotate(0.5*Math.PI* signs[a]).scaleFactor(0.5*thickness);
            const pOffset = p1.clone().move(vecOffset);
            const line = new Line(p1, pOffset); 

            // if the new line intersects the previous one,
            // it means we try to place a point BEFORE the previous one (this happens in the shorter side of (tight) corners)
            // this is bad and ugly, so just set this point to the previous one
            // (why not remove it? Left and Right side should have an identical number of points, so you can easily match them.)
            // @TODO: it would be better to modify it in a smarter way, but I just don't know how ...
            if(lineIntersectsLine(line, lastLines[a]))
            {
                pOffset.set(lastLines[a].end);
            }

            lastLines[a] = line;
            extrudes[a].push(pOffset);
        }
    }

    return [extrudes[0], extrudes[1].reverse()].flat();
}