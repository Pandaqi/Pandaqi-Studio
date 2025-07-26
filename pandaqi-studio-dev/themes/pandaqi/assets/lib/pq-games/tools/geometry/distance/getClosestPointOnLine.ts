import Line from "../line";
import Point from "../point";

// @SOURCE: https://stackoverflow.com/questions/32281168/find-a-point-on-a-line-closest-to-a-third-point-javascript
export default (line:Line, point:Point) =>
{
    const vec = line.vector(); // atob
    const lineStartToPoint = line.start.vecTo(point); // atop
    const lineLength = line.length(); // len
    
    let dot = lineStartToPoint.dot(vec);
    const t = Math.min(1, Math.max(0, dot / lineLength));

    dot = (vec.x * lineStartToPoint.y) - (vec.y * lineStartToPoint.x); // cross product, right?
    return new Point(
        line.start.x + t * vec.x,
        line.start.y + t * vec.y
    )
}