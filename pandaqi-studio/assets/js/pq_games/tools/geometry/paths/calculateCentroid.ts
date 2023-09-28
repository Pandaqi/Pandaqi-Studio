import Point from "../point";

// @SOURCE: https://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript
export default (points:Point[]) =>
{
    if(points.length <= 0) { return new Point(); }
    if(points.length <= 1) { return points[0].clone(); }
    if(points.length <= 2) { return points[0].halfwayTo(points[1]).clone(); }

    points = points.slice();
    
    const numPoints = points.length;
    const first = points[0].clone();
    const last = points[numPoints-1].clone();

    // make sure we return to end
    if(first.x != last.x || first.y != last.y) { points.push(first); }

    let twiceArea = 0;
    let f = 0;
    
    const center = new Point();
    for(let i = 0; i < numPoints; i++)
    {
        const p1 = points[i];
        const p2 = points[(i+1) % numPoints];
        f = (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x);
        twiceArea += f;

        center.add(new Point(
            (p1.x + p2.x - 2 * first.x) * f,
            (p1.y + p2.y - 2 * first.y) * f
        ));
    }

    f = twiceArea*3;
    return center.scaleFactor(1.0 / f).add(first);
}