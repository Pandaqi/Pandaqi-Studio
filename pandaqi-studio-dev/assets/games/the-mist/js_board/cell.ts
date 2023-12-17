import Point from "js/pq_games/tools/geometry/point";

export default class Cell
{
    pos: Point;
    num: number;
    icons: string[];
    nbs: Cell[];
    start:boolean;
    
    constructor(pos:Point, num:number)
    {
        this.pos = pos;
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