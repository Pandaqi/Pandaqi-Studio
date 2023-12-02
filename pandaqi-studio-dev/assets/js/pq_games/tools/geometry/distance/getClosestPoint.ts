import Point from "../point";
import Shape, { PathLike } from "../shape";

export default (p:Point, list:PathLike) =>
{
    if(list instanceof Shape) { list = list.toPath(); }

    let closestDist = Infinity;
    let closestPoint = null;
    for(const point of list)
    {
        const distSquared = p.distSquaredTo(point);
        if(distSquared > closestDist) { continue; }
        closestDist = distSquared;
        closestPoint = point; 
    }
    return closestPoint;
}