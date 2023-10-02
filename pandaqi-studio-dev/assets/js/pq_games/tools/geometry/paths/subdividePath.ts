import Point from "../point";
import calculatePathLength from "./calculatePathLength";

interface SubDivideParams
{
    path: Point[],
    chunkSize?: number
    numChunks?: number
}

export default (params:SubDivideParams) =>
{
    // chop the path into lots of (regularly sized) chunks
    const path = params.path;
    if(path.length <= 1) { return []; }

    const pathChopped : Point[] = [];
    let chunkSize = params.chunkSize;
    if(params.numChunks)
    {
        const length = calculatePathLength(path);
        chunkSize = length / params.numChunks;
    }


    const first = path[0];
    const last = path[path.length - 1];
    const selfClosing = first.matches(last);
    const pathLengthToConsider = selfClosing ? path.length : path.length - 1;

    for(let i = 0; i < pathLengthToConsider; i++)
    {
        const curPoint = path[i];
        const nextPoint = path[(i + 1) % path.length];

        const vec = curPoint.vecTo(nextPoint);
        const dist = vec.clone().length();
        const vecNorm = vec.clone().normalize();
        const numSteps = Math.floor(dist / chunkSize);

        const offset = vecNorm.clone().scaleFactor(chunkSize);
        let p = curPoint.clone();
        pathChopped.push(p);
        for(let a = 0; a < numSteps; a++)
        {
            p = p.clone().move(offset);
            pathChopped.push(p);
        }
    }

    // if the chunks don't fit perfectly, we forget to add the final point 
    // so do that now
    if(!pathChopped[pathChopped.length - 1].matches(last))
    {
        pathChopped.push(last.clone());
    }

    return pathChopped;
}