import Point from "../point"
import ArcData from "./arcData"

interface ArcParams
{
    from:Point
    to:Point
    resolution?:number
    arcData?:ArcData
}

// Formulas taken from SVG Implementation Notes: https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
// SVG takes its arc input as "endpoint parametrization"
// I convert it to "center parametrization"
// So I can just draw it like points on a circle/ellipse and return that

export default (params:ArcParams) =>
{
    const d = params.arcData ?? new ArcData();
    const phi = d.rotation;
    const from = params.from;
    const resolution = params.resolution ?? 32;
    const to = params.to;
    let rad = d.radius;

    // SAFEGUARD: no zero or negative radius
    if(rad.x == 0 || rad.y == 0) { return [from, to]; }
    rad = rad.clone().abs();

    // move translation/rotation to 0 for easy calculations
    const offset = from.clone().sub(to).scaleFactor(0.5);
    const pos1 = new Point(
        Math.cos(phi) * offset.x + Math.sin(phi) * offset.y,
        -Math.sin(phi) * offset.x + Math.cos(phi) * offset.y
    );

    let sign = (d.goClockwise != d.takeLongerRoute) ? 1 : -1;

    // SAFEGUARD: ensure radii have a solution
    const lambda = Math.pow(pos1.x,2) / Math.pow(rad.x,2) + Math.pow(pos1.y,2) / Math.pow(rad.y,2);
    if(lambda > 1)
    {
        rad.x = Math.sqrt(lambda) * rad.x;
        rad.y = Math.sqrt(lambda) * rad.y;
    }

    // calculate ellipse center
    const factor1 = Math.pow(rad.x, 2) * Math.pow(rad.y, 2) - Math.pow(rad.x,2) * Math.pow(pos1.y, 2) - Math.pow(rad.y,2) * Math.pow(pos1.x, 2);
    const factor2 = Math.pow(rad.x, 2) * Math.pow(pos1.y, 2) + Math.pow(rad.y, 2) * Math.pow(pos1.x, 2);

    const factor = sign * Math.sqrt(factor1 / factor2);
    const cpos1 = new Point(
        factor * (rad.x * pos1.y) / rad.y,
        -factor * rad.y * pos1.x / rad.x
    );

    // undo the offset to get the real ellipse center
    const mid = from.halfwayTo(to);
    const cpos = new Point(
        Math.cos(phi) * cpos1.x - Math.sin(phi) * cpos1.y + mid.x,
        Math.sin(phi) * cpos1.x + Math.cos(phi) * cpos1.y + mid.y
    )

    // from this, calculate where to start and how long the angle should be
    const angleVector = new Point(
        (pos1.x-cpos1.x)/rad.x,
        (pos1.y-cpos1.y)/rad.y
    );

    const angleVectorDelta = new Point(
        (-pos1.x-cpos1.x)/rad.x,
        (-pos1.y-cpos1.y)/rad.y
    )

    const startAngle = new Point(1,0).angleTo(angleVector);
    let deltaAngle = angleVector.angleTo(angleVectorDelta);

    // if sweep = 0 and delta > 0, subtract 360 degrees
    // if sweep = 1 and delta < 0, add 360 degrees
    if(!d.goClockwise && deltaAngle > 0) { deltaAngle -= 2*Math.PI; }
    if(d.goClockwise && deltaAngle < 0) { deltaAngle += 2*Math.PI; }

    // now we have our center position, start, and offset
    // so just draw through that ellipse
    // @TODO: does it properly handle rotation now???
    const incrementAngle = Math.abs(deltaAngle) / (resolution - 1);
    const arr = [];
    for(let i = 0; i < resolution; i++)
    {
        const ang = startAngle + i*incrementAngle
        const p = new Point(
            cpos.x + Math.cos(ang)*rad.x,
            cpos.y + Math.sin(ang)*rad.y
        )
        arr.push(p);
    }
    return arr;
}