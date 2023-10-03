import Path from "../paths/path";
import Point from "../point";
import scalePathAbsolute from "../transform/scalePathAbsolute";

interface BevelParams
{
    path: Point[],
    offset?: number
}

// How does it work?
// It creates a second version of the polygon/path, but scaled inward (towards center)
// Then it creates "rectangles" between the original line (outerPath) and the inner line (innerPath)
// Those are your bevels, color/use them as you wish
export default (params:BevelParams) =>
{
    const outerPath = params.path;
    const offset = params.offset ?? 10;
    const innerPath = scalePathAbsolute(outerPath, offset);
    
    let shapes : Path[] = [];
    for(let i = 0; i < outerPath.length; i++)
    {
        const nextIndex = (i + 1) % outerPath.length;
        const p1 = outerPath[i];
        const p2 = outerPath[nextIndex];

        const q1 = innerPath[i];
        const q2 = innerPath[nextIndex];

        const points = [
            p1.clone(),
            p2.clone(),
            q2.clone(),
            q1.clone()
        ]

        const shape = new Path({ points: points });
        shapes.push(shape);
    }

    return shapes;
}