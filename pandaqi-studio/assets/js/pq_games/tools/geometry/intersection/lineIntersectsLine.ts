import Line from "../line";
import Point from "../point";

// @SOURCE: https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
const lineIntersectsLineRaw = (a:number, b:number, c:number, d:number, p:number, q:number, r:number, s:number) => 
{
    const eps = 0.00001; // epsilon always needed with these kinds of operations
    var det:number, gamma:number, lambda:number;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) { return false; } // parallel or anti-parallel
    
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return ((0-eps) < lambda && lambda < (1+eps)) && ((0-eps) < gamma && gamma < (1+eps));
}

const lineIntersectsLineFromPoints = (a:Point, b:Point, p:Point, q:Point) =>
{
    return lineIntersectsLineRaw(a.x, a.y, b.x, b.y, p.x, p.y, q.x, q.y);
}

const lineIntersectsLine = (a:Line, b:Line) =>
{
    return lineIntersectsLineFromPoints(a.start, a.end, b.start, b.end);
}

export { lineIntersectsLineRaw, lineIntersectsLineFromPoints, lineIntersectsLine }