import Line from "../line";
import Point from "../point";

export default (points:Point[]) =>
{
    const arr = [];
    for(let i = 0; i < points.length; i++)
    {
        const p1 = points[i];
        const p2 = points[(i+1) % points.length];
        const l = new Line(p1, p2);
        arr.push(l);
    }
    return arr;
}