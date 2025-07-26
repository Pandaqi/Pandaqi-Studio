import Point from "../point";

export default (size:Point, offset:Point) =>
{
    return [
        offset.clone(),
        new Point(size.x - offset.x, offset.y),
        size.clone().sub(offset.clone()),
        new Point(offset.x, size.y - offset.y)
    ]
}