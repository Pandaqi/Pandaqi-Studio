import Point from "js/pq_games/tools/geometry/point";

export default class Cell
{
    pos: Point;
    type: string;
    crossedOut: boolean;
    nbs: Cell[];
    
    constructor(pos:Point, type:string)
    {
        this.pos = pos;
        this.type = type;
    }

    setNeighbors(nbs:Cell[]) { this.nbs = nbs; }
    getNeighbors() { return this.nbs; }
}