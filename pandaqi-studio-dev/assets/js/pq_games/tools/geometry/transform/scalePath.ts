import calculateCenter from "../paths/calculateCenter";
import Point from "../point";
import Shape, { PathLike } from "../shape";

export default (path:PathLike, scale:number|Point) : Point[] =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    const center = calculateCenter(path);
    const arr = [];
    for(const point of path)
    {
        const newPoint = point.clone().sub(center).scale(scale).add(center);
        arr.push(newPoint);
    }
    return arr;
}