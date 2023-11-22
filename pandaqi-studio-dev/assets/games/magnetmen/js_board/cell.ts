import Point from "js/pq_games/tools/geometry/point";

export default class Cell
{
    pos: Point;
    type: string;
    
    constructor(pos:Point, type:string)
    {
        this.pos = pos;
        this.type = type;
    }
}