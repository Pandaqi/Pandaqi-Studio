import Point from "../point";

interface Params
{
    pos?: Point,
    num?: number,
    dims: Point[]|Point|number,
    dir?: Point,
}

export default (params:Params) =>
{
    const num = params.num ?? 1;
    if(num <= 0) { return []; }

    const basePos = params.pos ?? new Point();
    if(num == 1) { return [basePos.clone()]; }

    const dir = params.dir ?? Point.RIGHT;

    let dims = params.dims;
    if(typeof dims === "number") { dims = new Point(dims); }
    const dimsDynamic : Point[] = Array.isArray(dims) ? dims : [];
    const nonUniformDims = dimsDynamic.length > 0;

    if(nonUniformDims)
    {
        let totalOffset = new Point();
        for(let i = 0; i < num; i++)
        {
            totalOffset.add(dims[i]);
        }
        totalOffset.sub(dimsDynamic[0].clone().scale(0.5));
        totalOffset.sub(dimsDynamic[dimsDynamic.length-1].clone().scale(0.5));
        totalOffset.scale(0.5);
        totalOffset.negate();

        const positions = [];
        let lastPos = basePos.clone().move(dir.clone().scale(totalOffset));
        for(let i = 0; i < num; i++)
        {
            positions.push(lastPos.clone());

            const isLastElement = i >= (num-1);
            if(isLastElement) { continue; }
            lastPos.add(dir.clone().scale(dimsDynamic[i]).scale(0.5));
            lastPos.add(dir.clone().scale(dimsDynamic[i+1]).scale(0.5));
        }

        return positions;
    }

    if((dims as Point).isZero()) { return []; }

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