import Point from "js/pq_games/tools/geometry/point";
import { NB_OFFSETS, CELLS } from "../js_shared/dictionary";

export default class Cell
{
    x:number
    y:number
    type:string
    hole:boolean
    river:boolean
    edge:string
    num:number

    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
        this.type = null;
        this.hole = false;
        this.river = false;
        this.edge = null;
        this.num = null;
    }

    getData() 
    { 
        if(this.river) { return { colorGroup: "blue" }; }
        if(!this.type) { return {}; }
        return CELLS[this.type]; 
    }

    setNum(n:number) { this.num = n; }
    getNum() { return this.num; }
    hasNum() { return this.num != null; }

    onEdge() { return this.edge != null; }
    setEdgeName(e:string) { this.edge = e; }
    getEdgeName() { return this.edge; }

    getPositionCenter() { return new Point().setXY(this.x+0.5, this.y+0.5); }
    getPositionTopLeft() { return new Point().setXY(this.x, this.y); }
    getPositionBottomRight() { return new Point().setXY(this.x + 1, this.y + 1); }

    setRiver(r: boolean) { this.river = r; }
    isRiver() { return this.river; }

    setType(t: string) { this.type = t; }
    getType() { return this.type; }
    hasType() { return this.type !== null; }

    setHole(h: boolean) { this.hole = h; }
    isHole() { return this.hole; }
    
    getValidNeighbors(grid: Cell[][])
    {
        const nbs = [];
        var basePos = this.getPositionTopLeft();
        for(const offset of Object.values(NB_OFFSETS))
        {
            var pos = basePos.clone().move(offset);
            if(this.outOfBounds(pos, grid)) { continue; }
            
            const cell = grid[pos.x][pos.y];
            if(cell.isHole()) { continue; }

            nbs.push(cell);
        }

        return nbs;
    }

    outOfBounds(pos: Point, grid: Cell[][])
    {
        return pos.x < 0 || pos.y < 0 || pos.x >= grid.length || pos.y >= grid[0].length
    }

    getPosAtBoardEdge() : Point
    {
        var pos = this.getPositionCenter();
        if(!this.onEdge()) { return pos; }
        var offset = NB_OFFSETS[this.getEdgeName()].clone().scaleFactor(0.5)
        pos.move(offset)
        return pos
    }

}