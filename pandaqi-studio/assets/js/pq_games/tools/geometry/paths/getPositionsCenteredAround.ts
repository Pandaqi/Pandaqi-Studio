import AlignValue from "js/pq_games/layout/values/alignValue";
import Point from "../point";

interface Params
{
    pos?: Point,
    num?: number,
    size: Point[]|Point|number,
    dir?: Point,
    align?: AlignValue
}

export default (params:Params) =>
{
    const num = params.num ?? 1;
    if(num <= 0) { return []; }

    const basePos = params.pos ?? new Point();
    if(num == 1) { return [basePos.clone()]; }

    const dir = params.dir ?? Point.RIGHT;
    const align = params.align ?? AlignValue.MIDDLE;

    let dims = params.size;
    if(typeof dims === "number") { dims = new Point(dims); }
    const dimsDynamic : Point[] = Array.isArray(dims) ? dims : [];
    const nonUniformDims = dimsDynamic.length > 0;

    // @TODO: find a clean way to merge the uniform and non-uniform code?
    if(nonUniformDims)
    {
        let totalOffset = new Point();
        for(let i = 0; i < num; i++)
        {
            totalOffset.add(dims[i]);
        }
        totalOffset.negate();

        if(align == AlignValue.START) { totalOffset.scale(0.0); }
        else if(align == AlignValue.MIDDLE) { totalOffset.scale(0.5); }
        else if(align == AlignValue.END) { totalOffset.scale(1.0); }

        totalOffset.add(dimsDynamic[0].clone().scale(0.5));

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

    const totalOffset = dir.clone().scaleFactor(num - 1).scale(dims).negate();
    
    if(align == AlignValue.START) { totalOffset.scale(0.0); }
    else if(align == AlignValue.MIDDLE) { totalOffset.scale(0.5); }
    else if(align == AlignValue.END) { totalOffset.scale(1.0); }

    const positions = [];
    for(let i = 0; i < num; i++)
    {
        const myOffset = dir.clone().scaleFactor(i).scale(dims);
        const pos = basePos.clone().move(totalOffset).move(myOffset);
        positions.push(pos);
    }
    return positions;
}