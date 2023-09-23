import rangeInteger from "../../random/rangeInteger";
import Point from "../point";
import subdividePath from "./subdividePath";

interface BiteParams
{
    path?: Point[],
    chunkSize?: number,
    biteBounds?: { min: number, max: number },
    chunksInterval?: { min: number, max: number }
}

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

export default (params:BiteParams) : Point[] => 
{
    const path = params.path;
    if(!path) { return []; }

    // chop the path into lots of (regularly sized) chunks
    const chunkSize = params.chunkSize ?? 10.0;
    const pathChopped : Point[] = subdividePath({ path: path, chunkSize: chunkSize });

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