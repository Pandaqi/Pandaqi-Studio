import calculateCenter from "../paths/calculateCenter";
import Shape, { PathLike } from "../shape";

export default (path:PathLike, rot:number) =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    const center = calculateCenter(path);
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