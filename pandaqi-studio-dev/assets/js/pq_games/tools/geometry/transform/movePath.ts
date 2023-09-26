import Point from "../point";

export default (path:Point[], offset:Point) : Point[] =>
{
    const arr = [];
    for(const point of path)
    {
        const newPoint = point.clone().move(offset);
        arr.push(newPoint);
    }
    return arr;
}