import pathToLineSegments from "../paths/pathToLineSegments";
import Point from "../point";
import { distToLine } from "./distToLine";

export default (point:Point, path:Point[]) =>
{
    let smallestDist = Infinity;
    let lines = pathToLineSegments(path);
    for(const line of lines)
    {
        smallestDist = Math.min(smallestDist, distToLine(point, line));
    }
    return smallestDist;
}