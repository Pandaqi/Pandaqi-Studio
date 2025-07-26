import Bounds from "../numbers/bounds";

export default (min:number|Bounds, max:number = null, step = 1) : number[] =>
{
    const bounds = (min instanceof Bounds) ? min : new Bounds(min, max);
    const arr = [];
    for(let i = bounds.min; i <= bounds.max; i += step)
    {
        arr.push(i);
    }
    return arr;
}