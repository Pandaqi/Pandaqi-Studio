import Point from "./point"

export default class Rectangle 
{
    center:Point
    extents:Point

    constructor(r:Record<string,any> = {})
    {
        this.center = r.center ?? new Point();
        this.extents = r.extents ?? new Point();
    }
}