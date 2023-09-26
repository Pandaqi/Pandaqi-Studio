import clamp from "../../numbers/clamp";
import range from "../../random/range";
import rangeNormal from "../../random/rangeNormal";
import Point from "../point";

interface RandomShapeParams
{
    center?:Point,
    radius?:number,
    corners?:number,
    chaos?:number,
    spikiness?:number
}

// @SOURCE: https://stackoverflow.com/questions/8997099/algorithm-to-generate-random-2d-polygon
const getRandomAngleSteps = (corners:number, chaos:number) =>
{
    const angles = []
    const lower = (2 * Math.PI / corners) - chaos
    const upper = (2 * Math.PI / corners) + chaos
    
    let cumsum = 0
    for(let i = 0; i < corners; i++)
    {
        const angle = range(lower, upper);
        angles.push(angle);
        cumsum += angle;
    }

    // normalize the steps so that point 0 and point n+1 are the same
    cumsum /= (2 * Math.PI);
    for(let i = 0; i < corners; i++)
    {
        angles[i] = angles[i] / cumsum;
    }
    return angles;
}

export default (params:RandomShapeParams) : Point[] =>
{
    const center = params.center ?? new Point();
    const radius = params.radius ?? 10;
    const corners = params.corners ?? 6;
    let chaos = clamp(params.chaos ?? 0.5, 0, 1);
    let spikiness = clamp(params.spikiness ?? 0.5, 0, 1);

    chaos *= 2 * Math.PI / corners
    spikiness *= radius;

    const angleSteps = getRandomAngleSteps(corners, chaos);

    const points = [];
    let angle = Math.random() * 2 * Math.PI;
    for(let i = 0; i < corners; i++)
    {
        const tempRadius = clamp(rangeNormal(radius, spikiness), 0, 2 * radius);
        const offset = new Point(Math.cos(angle), Math.sin(angle)).scaleFactor(tempRadius);
        const point = center.clone().add(offset);
        points.push(point);
        angle += angleSteps[i];
    }

    return points;
}