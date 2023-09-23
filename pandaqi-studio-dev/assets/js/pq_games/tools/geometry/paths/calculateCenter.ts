import Point from "../point";

export default (points:Point[]) =>
{
    const center = new Point();
    const numPoints = points.length;
    for(const point of points)
    {
        center.add(point);
    }
    center.scaleFactor(1.0 / numPoints);
    return center;
}