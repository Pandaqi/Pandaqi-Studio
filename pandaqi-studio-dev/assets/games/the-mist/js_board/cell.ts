import Point from "js/pq_games/tools/geometry/point";

export default class Cell
{
    pos: Point;
    num: number;
    icons: string[];
    
    constructor(pos:Point, num:number)
    {
        this.pos = pos;
        this.num = num;
    }
}