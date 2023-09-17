import Point from "js/pq_games/tools/geometry/point";

interface ColorStopParams
{
    pos?:Point,
    color?:string
}

export default class ColorStop
{
    pos: Point;
    color: string;

    constructor(params:ColorStopParams = {})
    {
        this.pos = params.pos ?? new Point();
        this.color = params.color ?? "black";
    }

    clone(deep = false)
    {
        let p = deep ? this.pos.clone() : this.pos;
        return new ColorStop({
            pos: p, color: this.color
        })
    }
}