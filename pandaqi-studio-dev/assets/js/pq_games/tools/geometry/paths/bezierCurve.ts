import Point from "../point"

interface CurveParams
{
    from:Point,
    to:Point,
    controlPoint1?:Point,
    controlPoint2?:Point,
    resolution?:number
}

function getPointAt(t:number, params:CurveParams)
{
    const from = params.from ?? new Point();
    const to = params.to ?? new Point();
    const cp1 = params.controlPoint1;
    const cp2 = params.controlPoint2;
    const quadratic = !cp2;
    if(quadratic) {
        return from.clone().scaleFactor(Math.pow(1-t, 2))
            .add(cp1.clone().scaleFactor(2*(1-t)*t))
            .add(to.clone().scaleFactor(Math.pow(t, 2)));
    } else {
        return from.clone().scaleFactor(Math.pow(1-t,3))
            .add(cp1.clone().scaleFactor(3*Math.pow(1-t,2)*t))
            .add(cp2.clone().scaleFactor(3*(1-t)*Math.pow(t,2)))
            .add(to.clone().scaleFactor(Math.pow(t,3)));
    }
}

export default (params:CurveParams) => 
{
    const resolution = params.resolution ?? 32;
    const points = [];
    const factor = 1.0 / (resolution - 1);
    for(let i = 0; i < resolution; i++)
    {
        const t = i * factor;
        points.push(getPointAt(t, params));
    }
    return points;
}