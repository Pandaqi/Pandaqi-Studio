import calculateCenter from "../paths/calculateCenter";
import Point from "../point";
import Shape, { PathLike } from "../shape";

export default (path:PathLike, rot:number, pivot = new Point()) =>
{
    if(path instanceof Shape) { path = path.toPath(); }
    if(rot == 0) { return path.slice(); }

    const center = pivot ?? calculateCenter(path);
    const newPath = [];
    for(const point of path)
    {
        const newPoint = point.clone().sub(center);
        newPoint.rotate(rot);
        newPoint.add(center);
        newPath.push(newPoint); 
    }
    return newPath;
}