import Line from "../line";
import Point from "../point";

const distToLineSegmentSquared = (p:Point, v:Point, w: Point) => {
    const l2 = v.distSquaredTo(w);
    if(Math.abs(l2) < 0.0001) { return p.distSquaredTo(v); }

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const closestPointOnLine = new Point({ 
        x: v.x + t * (w.x - v.x), 
        y: v.y + t * (w.y - v.y) 
    });

    return p.distSquaredTo(closestPointOnLine);
}

const distToLineSegment = (p:Point, v:Point, w:Point) => { return Math.sqrt(distToLineSegmentSquared(p, v, w)); }
const distToLine = (p:Point, l:Line) => { return distToLineSegment(p, l.start, l.end); }
const distToLineSegments = (p:Point, arr:Point[], closeLines = true) =>
{
    let smallestDist = Infinity;
    let numPoints = arr.length;
    if(!closeLines) { numPoints--; }
    for(let i = 0; i < numPoints; i++)
    {
        const p1 = arr[i];
        const p2 = arr[(i + 1) % arr.length];
        smallestDist = Math.min(smallestDist, distToLineSegment(p, p1, p2));
    }
    return smallestDist;
}

export { distToLineSegment, distToLineSegmentSquared, distToLineSegments, distToLine }