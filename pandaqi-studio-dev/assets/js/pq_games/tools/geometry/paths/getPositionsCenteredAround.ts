import Point from "../point";

interface Params
{
    pos?: Point,
    num?: number,
    dims: Point|number,
    dir?: Point,
}

export default (params:Params) =>
{
    const num = params.num ?? 1;
    if(num <= 0) { return []; }

    const basePos = params.pos ?? new Point();
    if(num == 1) { return [basePos.clone()]; }

    const dims = new Point(params.dims);
    const dir = params.dir ?? Point.RIGHT;

    const totalOffset = dir.clone().scaleFactor(-0.5*(num - 1)).scale(dims);
    const positions = [];
    for(let i = 0; i < num; i++)
    {
        const myOffset = dir.clone().scaleFactor(i).scale(dims);
        const pos = basePos.clone().move(totalOffset).move(myOffset);
        positions.push(pos);
    }
    return positions;
}