import Point from "./point";

export default class Line
{
    start: Point;
    end: Point;
    
    constructor(start, end)
    {
        this.start = start;
        this.end = end;
    }

    getStart() { return this.start; }
    getEnd() { return this.end; }
    angle() { return Math.atan2(this.end.y-this.start.y, this.end.x-this.start.x); }
    vec() { return this.start.vecTo(this.end); }
    center() { return this.start.clone().add(this.end).scaleFactor(0.5); }
    normal()
    {
        const vec = this.vec();
        const oldY = vec.y;
        vec.y = -vec.x;
        vec.x = oldY;
    }
}