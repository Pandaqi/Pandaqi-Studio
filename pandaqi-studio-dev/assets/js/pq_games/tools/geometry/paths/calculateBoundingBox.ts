import Point from "../point";
import Rectangle from "../rectangle";

export default (path:Point[]) : Rectangle =>
{
    const topLeft = new Point(Infinity, Infinity);
    const bottomRight = new Point(-Infinity, -Infinity);
    for(const point of path)
    {
        topLeft.x = Math.min(topLeft.x, point.x);
        topLeft.y = Math.min(topLeft.y, point.y);

        bottomRight.x = Math.max(bottomRight.x, point.x);
        bottomRight.y = Math.max(bottomRight.y, point.y);
    }

    const center = topLeft.halfwayTo(bottomRight);
    const extents = bottomRight.clone().sub(topLeft);
    return new Rectangle({ center: center, extents: extents });
}