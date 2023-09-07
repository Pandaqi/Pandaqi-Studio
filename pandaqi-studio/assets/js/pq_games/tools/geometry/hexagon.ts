import Point from "./point";

export default class Hexagon 
{
    center:Point
    radius:number

    constructor(h:Record<string,any> = {})
    {
        this.center = h.center ?? new Point();
        this.radius = h.radius ?? 10;
    }
}