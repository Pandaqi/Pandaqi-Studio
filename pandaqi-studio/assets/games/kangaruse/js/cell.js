import Point from "js/pq_games/tools/geometry/point";
import { NB_OFFSETS } from "./dictionary";

export default class Cell
{
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

    setNum(n) { this.num = n; }
    getNum() { return this.num; }
    hasNum() { return this.num != null; }

    onEdge() { return this.edge != null; }
    setEdgeName(e) { this.edge = e; }
    getEdgeName() { return this.edge; }

    getPositionCenter() { return new Point().setXY(this.x+0.5, this.y+0.5); }
    getPositionTopLeft() { return new Point().setXY(this.x, this.y); }
    getPositionBottomRight() { return new Point().setXY(this.x + 1, this.y + 1); }

    setRiver(r) { this.river = r; }
    isRiver() { return this.river; }

    setType(t) { this.type = t; }
    getType() { return this.type; }
    hasType() { return this.type !== null; }

    setHole(h) { this.hole = h; }
    isHole() { return this.hole; }
    
    getValidNeighbors(grid)
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

    outOfBounds(pos, grid)
    {
        return pos.x < 0 || pos.y < 0 || pos.x >= grid.length || pos.y >= grid[0].length
    }

    getPosAtBoardEdge()
    {
        var pos = this.getPositionCenter();
        if(!this.onEdge()) { return pos; }
        var offset = NB_OFFSETS[this.getEdgeName()].clone().scaleFactor(0.5)
        pos.move(offset)
        return pos
    }

}