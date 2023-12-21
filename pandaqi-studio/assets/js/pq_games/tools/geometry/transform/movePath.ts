import Point from "../point";
import Shape, { PathLike } from "../shape";

export default (path:PathLike, offset:Point) : Point[] =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    const arr = [];
    for(const point of path)
    {
        const newPoint = point.clone().move(offset);
        arr.push(newPoint);
    }
    return arr;
}