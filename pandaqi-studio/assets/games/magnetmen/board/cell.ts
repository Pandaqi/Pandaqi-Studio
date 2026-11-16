import { Vector2 } from "lib/pq-games";


export default class Cell
{
    pos: Vector2;
    type: string;
    crossedOut: boolean;
    nbs: Cell[];
    
    constructor(pos:Vector2, type:string)
    {
        this.pos = pos;
        this.type = type;
    }

    setNeighbors(nbs:Cell[]) { this.nbs = nbs; }
    getNeighbors() { return this.nbs; }
}