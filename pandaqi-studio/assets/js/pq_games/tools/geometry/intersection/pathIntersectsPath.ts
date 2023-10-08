import pathToLineSegments from "../paths/pathToLineSegments";
import Point from "../point";
import { lineIntersectsLine } from "./lineIntersectsLine";

export default (path1:Point[], path2:Point[]) =>
{
    const lines1 = pathToLineSegments(path1);
    const lines2 = pathToLineSegments(path2);
    for(const line1 of lines1)
    {
        for(const line2 of lines2)
        {
            if(lineIntersectsLine(line1, line2)) { return true; }
        }
    }
    return false;
}