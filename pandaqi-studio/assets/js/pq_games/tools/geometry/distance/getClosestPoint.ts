import Point from "../point";

export default (p:Point, list:Point[]) =>
{
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