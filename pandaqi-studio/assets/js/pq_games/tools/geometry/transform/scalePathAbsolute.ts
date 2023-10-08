import calculateCenter from "../paths/calculateCenter";
import Point from "../point";

export default (path:Point[], offset:number) : Point[] =>
{
    const center = calculateCenter(path);
    const arr = [];
    for(const point of path)
    {
        const vecToCenter = point.vecTo(center).normalize();
        vecToCenter.scale(offset);
        const newPoint = point.clone().add(vecToCenter);
        arr.push(newPoint);
    }
    return arr;
}