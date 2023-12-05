import Point from "js/pq_games/tools/geometry/point";

export default class Cell
{
    pos: Point;
    num: number;
    icons: string[];
    nbs: Cell[];
    
    constructor(pos:Point, num:number)
    {
        this.pos = pos;
        this.num = num;
        this.icons = [];
    }

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