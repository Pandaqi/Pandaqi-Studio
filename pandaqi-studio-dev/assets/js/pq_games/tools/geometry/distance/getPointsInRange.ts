import Point from "../point";

export default (p:Point, list:Point[], dist:number) =>
{
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