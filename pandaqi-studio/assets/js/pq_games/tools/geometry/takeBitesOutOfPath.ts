import rangeInteger from "../random/rangeInteger";
import Point from "./point";

function takeBite(idx:number, path:Point[], dist:number)
{
    const curPoint = path[idx];
    const nextPoint = path[(idx + 1) % path.length];
    const middlePoint = curPoint.halfwayTo(nextPoint);
    const vec = curPoint.vecTo(nextPoint).normalize();
    const vecOrtho = vec.ortho();

    const bitePoint = middlePoint.add(vecOrtho.scaleFactor(dist));
    path.splice(idx + 1, 0, bitePoint);
}

export default (params:Record<string,any>) : Point[] => 
{
    const path = params.path;
    if(!path) { return []; }

    // chop the path into lots of (regularly sized) chunks
    const pathChopped : Point[] = [];
    const chunkSize = params.chunkSize ?? 10.0;
    for(let i = 0; i < path.length; i++)
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

    // then randomly move some of them inward
    const chunksInterval = params.chunksInterval ?? { min: 3, max: 10 };
    const biteBounds = params.biteBounds ?? { min: 15, max: 20 };
    const maxNumChunks = pathChopped.length;
    let index = rangeInteger(0, maxNumChunks - 1);
    let chunksConsidered = 0;
    while(chunksConsidered < maxNumChunks)
    {
        const randDist = rangeInteger(biteBounds.min, biteBounds.max);
        takeBite(index, pathChopped, randDist);

        const offset = rangeInteger(chunksInterval.min, chunksInterval.max);
        chunksConsidered += offset
        index = (index + offset) % maxNumChunks;        
    }

    return pathChopped;
}