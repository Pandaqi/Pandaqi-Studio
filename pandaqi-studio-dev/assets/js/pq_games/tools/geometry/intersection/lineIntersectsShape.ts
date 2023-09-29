import Line from "../line";
import pathToLineSegments from "../paths/pathToLineSegments";
import Shape from "../shape";
import { lineIntersectsLine } from "./lineIntersectsLine";

const lineIntersectsShape = (line:Line, shape:Shape) =>
{
    const segments = pathToLineSegments(shape.toPath());
    for(const segment of segments)
    {
        if(lineIntersectsLine(line, segment)) { return true; }
    }
    return false;
}

export default lineIntersectsShape;