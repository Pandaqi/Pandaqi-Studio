import Point from "../geometry/point";

type bounds = { min: number, max: number }

export default (val:number, min:number|bounds|Point = -Infinity, max:number = Infinity) =>
{
    // @TODO: find some automatic conversion for everything that can receive optional bounds/Point combo?
    if(min instanceof Point)
    {
        max = min.y;
        min = min.x;
    }

    if(typeof min == "object")
    {
        max = min.max;
        min = min.min;
    }

    return Math.max(Math.min(val, max), min);
}