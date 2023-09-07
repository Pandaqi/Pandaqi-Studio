import Point from "./point"

export default class Circle 
{
    center:Point
    radius:number

    constructor(c:Record<string,any> = {})
    {
        this.center = c.center ?? new Point();
        this.radius = c.radius ?? 10;
    }
}