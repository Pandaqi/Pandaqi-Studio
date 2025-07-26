import getClosestPointOnLine from "../distance/getClosestPointOnLine";
import Line from "../line";
import Point from "../point";
import Shape, { PathLike } from "../shape";
import calculateBoundingBox from "./calculateBoundingBox";

export default (path:PathLike, axis: string|Point, pivot = Point.CENTER) =>
{
    if(path instanceof Shape) { path = path.toPath(); }

    // all this work just to calculate the exact LINE slicing the shape for mirroring
    const boundingBox = calculateBoundingBox(path);

    if(axis == "x") { axis = Point.RIGHT; }
    else if(axis == "y") { axis = Point.DOWN; }
    else if(axis == "diag_down") { axis = new Point(1,1); } // @TODO: should probably standardize something about this
    else if(axis == "diag_up") { axis = new Point(1,-1); }
    if(!(axis instanceof Point)) { axis = Point.RIGHT; }

    const maxExtension = boundingBox.size.largestSide();
    const axisLeft = axis.clone().scale(new Point(-pivot.x * maxExtension, -pivot.y * maxExtension));
    const axisRight = axis.clone().scale(new Point((1.0 - pivot.x) * maxExtension, (1.0 - pivot.y) * maxExtension));

    const anchor = boundingBox.getPosition();
    const mirrorLine = new Line(anchor.clone().add(axisLeft), anchor.clone().add(axisRight));

    // for each point, find the perpendicular vector to line,
    // then simply extend it by that distance on the other side.
    // (reverse array to keep same winding order as before)
    const arr = [];
    for(const point of path)
    {
        const perpPoint = getClosestPointOnLine(mirrorLine, point);
        const vec = point.vecTo(perpPoint);
        const mirroredPoint = perpPoint.clone().move(vec);
        arr.push(mirroredPoint);
    }

    return arr.reverse();
}