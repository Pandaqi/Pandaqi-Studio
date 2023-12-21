import Point from "../point";
import Shape, { PathLike } from "../shape";

export default (p:Point, list:PathLike, dist:number) =>
{
    if(list instanceof Shape) { list = list.toPath(); }

    const arr = [];
    const maxDistSquared = Math.pow(dist, 2);
    for(const point of list)
    {
        const distSquared = p.distSquaredTo(point);
        if(distSquared > maxDistSquared) { continue; }
        arr.push(point);
    }
    return arr;
}