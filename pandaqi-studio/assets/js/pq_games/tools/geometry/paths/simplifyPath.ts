import Point from "../point";

interface SimplifyPathParams
{
    path: Point[],
    stepSize?: number
    numSteps?: number
}

// reduces #points by sampling at regular intervals
export default (params:SimplifyPathParams) : Point[] =>
{
    const path = params.path;
    const numPoints = path.length;
    let numSteps = params.numSteps;
    if(params.stepSize)
    {
        numSteps = Math.floor(numPoints / params.stepSize);
    }

    numSteps = Math.max(numSteps, 1);

    const stepSize = Math.floor(numPoints / numSteps);
    const arr = [];
    for(let i = 0; i < numSteps; i++)
    {
        arr.push(path[i*stepSize]);
    }
    arr.push(path[path.length-1]);
    return arr;
}