
import Cell from "./cell"
import BoardDisplay from "./boardDisplay"
import { fromArray } from "lib/pq-games";

export default class BoardRiver
{
    cells : Cell[]
    crossMap : boolean

    constructor()
    {
        this.cells = [];
        this.crossMap = false;
    }

    isEmpty() { return this.count() <= 0; }
    count() { return this.getCells().length; }
    getCells() { return this.cells.slice(); }
    getAsLine(boardDisplay:BoardDisplay) {
        const arr = [];
        for(let i = 0; i < this.cells.length; i++)
        {
            const cell = this.cells[i];
            const pos = boardDisplay.convertToRealUnits(cell.getPositionCenter());

            if(i == 0 && cell.onEdge() && this.crossMap)
            {
                const posExtra = boardDisplay.convertToRealUnits(cell.getPosAtBoardEdge());
                arr.push(posExtra);
            }

            arr.push(pos);

            if(i == this.cells.length-1 && cell.onEdge() && this.crossMap)
            {
                const posExtra = boardDisplay.convertToRealUnits(cell.getPosAtBoardEdge());
                arr.push(posExtra);
            }
        }
        return arr;
    }

    flow(start:Cell, grid:Cell[][], bounds:any, crossMap = false) 
    {
        this.crossMap = crossMap;

        var numTries = 0
        const maxTries = crossMap ? 1000 : 100
        do {
           this.cells = this.createRiver(start, grid, bounds, crossMap)
           numTries++;
        } while(this.cells.length <= 0 && numTries < maxTries);
        
        for(const cell of this.cells)
        {
            this.convertCell(cell);
        }
    }

    createRiver(start:Cell, grid:Cell[][], bounds:any, crossMap = false)
    {
        var list = [start];
        var lastCell = start;
        var validEndCell = false;
        var rightLength = false;

        while(!rightLength || !validEndCell)
        {
            var nbs = lastCell.getValidNeighbors(grid);
            nbs = this.filterAlreadyVisited(nbs, list);
            nbs = this.filterAlreadyRivers(nbs);
            if(nbs.length <= 0) { break; }

            var nb = fromArray(nbs);
            list.push(nb);
            lastCell = nb;
            
            rightLength = list.length <= bounds.max && list.length >= bounds.min;
            
            if(crossMap) { validEndCell = this.edgesAreOpposite(lastCell, start); }
            else { validEndCell = true; }
        }

        if(!rightLength || !validEndCell) { return []; }
        return list;
    }

    edgesAreDifferent(lastCell:Cell, start:Cell)
    {
        if(!lastCell.onEdge() || !start.onEdge()) { return false; }
        var a = lastCell.getEdgeName();
        var b = start.getEdgeName();
        return a != b;
    }

    edgesAreOpposite(lastCell:Cell, start:Cell)
    {
        if(!lastCell.onEdge() || !start.onEdge()) { return false; }
        var a = lastCell.getEdgeName();
        var b = start.getEdgeName();
        return (a == "top" && b == "bottom") || (a == "left" && b == "right") || (a == "bottom" && b == "top") || (a == "right" && b == "left");
    }

    convertCell(cell:Cell)
    {
        cell.setRiver(true);
    }

    filterAlreadyRivers(list:Cell[])
    {
        const arr = [];
        for(const cell of list)
        {
            if(cell.isRiver()) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    filterAlreadyVisited(list:Cell[], listMatch:Cell[])
    {
        const arr = [];
        for(const cell of list)
        {
            if(listMatch.includes(cell)) { continue; }
            arr.push(cell);
        }
        return arr;
    }
}