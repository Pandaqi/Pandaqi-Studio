import Point from "../point";
import bezierCurve from "./bezierCurve";
import calculatePathLength from "./calculatePathLength";
import subdividePath from "./subdividePath";

// approximates the bezier curve needed so that the curve itself matches some target length
export default (params) => 
{
    const line = params.line;
    const controlPointRotation = params.controlPointRotation ?? 0.5*Math.PI;
    const targetLength = params.targetLength ?? 0.0;
    const stepSize = params.stepSize ?? 1.0;

    const alreadyFine = line.length() >= targetLength;
    if(alreadyFine) 
    { 
        const pathStraight = [line.start, line.end];
        return subdividePath({ path: pathStraight, numChunks: params.resolution }); 
    }

    const paramsCurve = {
        resolution: params.resolution,
        from: line.start,
        to: line.end,
        controlPoint1: null
    }

    let offset = 0;
    let rightLength = false;

    const midPoint : Point = paramsCurve.from.halfwayTo(paramsCurve.to);
    const orthoVec : Point = paramsCurve.from.vecTo(paramsCurve.to)
    orthoVec.normalize().rotate(controlPointRotation);

    // every iteration, we move the control point even further away
    // then we approximate path length to see if it matches our target
    let path;
    while(!rightLength)
    {
        offset += stepSize;
        
        const cp = midPoint.clone().add(orthoVec.clone().scaleFactor(offset));
        paramsCurve.controlPoint1 = cp;

        path = bezierCurve(paramsCurve);
        const length = calculatePathLength(path);

        rightLength = length >= targetLength;
    }

    return path;
}