import calculateCenter from "../paths/calculateCenter";
import Point from "../point";

export default (path:Point[], scale:number|Point) : Point[] =>
{
    const center = calculateCenter(path);
    const arr = [];
    for(const point of path)
    {
        const newPoint = point.clone().sub(center).scale(scale).add(center);
        arr.push(newPoint);
    }
    return arr;
}