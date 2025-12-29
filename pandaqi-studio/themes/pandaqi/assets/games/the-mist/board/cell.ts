import { Vector2 } from "lib/pq-games";


export default class Cell
{
    x: number;
    y: number;
    pos: Vector2;
    num: number;
    icons: string[];
    nbs: Cell[];
    start:boolean;
    
    constructor(pos:Vector2, num:number)
    {
        this.pos = pos;
        this.x = this.pos.x;
        this.y = this.pos.y;
        this.num = num;
        this.icons = [];
        this.start = false;
    }

    isStartingPosition() { return this.start; }
    makeStartingPosition() { this.start = true; }

    hasFreeSpace() { return this.numIconsNeeded() > 0; }
    countIcons() { return this.icons.length; }
    hasIcon(i:string) { return this.icons.includes(i); }
    addIcon(i:string)
    {
        this.icons.push(i);
    }

    numIconsNeeded()
    {
        return this.num - this.icons.length;
    }

    getNeighbors() { return this.nbs.slice(); }
    setNeighbors(nbs)
    {
        this.nbs = nbs;
    }
}