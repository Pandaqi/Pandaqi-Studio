import Point from "../point";
import Shape, { PathLike } from "../shape";

export default (points:PathLike) =>
{
    if(points instanceof Shape) { points = points.toPath(); }

    const center = new Point();
    let numPoints = points.length;
    const closesItself = points[0] == points[points.length-1];
    if(closesItself) { numPoints--; }

    for(let i = 0; i < points.length; i++)
    {
        if(i == points.length-1 && closesItself) { continue; }
        center.add(points[i]);
    }
    center.scaleFactor(1.0 / numPoints);
    return center;
}