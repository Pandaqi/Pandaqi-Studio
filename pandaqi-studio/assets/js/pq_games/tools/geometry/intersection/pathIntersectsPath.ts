import pathToLineSegments from "../paths/pathToLineSegments";
import { PathLike } from "../shape";
import { lineIntersectsLine } from "./lineIntersectsLine";

export default (path1:PathLike, path2:PathLike) =>
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