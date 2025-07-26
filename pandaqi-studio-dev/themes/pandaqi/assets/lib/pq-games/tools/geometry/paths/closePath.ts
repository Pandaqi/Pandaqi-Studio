import Shape, { PathLike } from "../shape";

export default (path:PathLike) =>
{
    if(path instanceof Shape) { path = path.toPath(); }
    const firstPoint = path[0];
    const lastPoint = path[path.length - 1];
    if(firstPoint == lastPoint) { return path; }
    path.push(firstPoint);
    return path;
}