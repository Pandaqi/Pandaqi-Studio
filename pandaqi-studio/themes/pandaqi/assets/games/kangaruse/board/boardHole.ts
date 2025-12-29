
import { rangeInteger, fromArray } from "lib/pq-games";
import Cell from "./cell"

export default class BoardHole
{
    cells: Cell[]

    constructor()
    {
        this.cells = [];
    }

    count() { return this.getCells().length; }
    getCells() { return this.cells; }
    grow(start:Cell, grid:Cell[][], bounds:any) 
    {
        var maxSize = rangeInteger(bounds.min, bounds.max);
        var list = [start];
        this.convertCell(start);
        while(list.length < maxSize)
        {
            const nbs : Cell[] = this.getAllValidNeighbors(list, grid);
            if(nbs.length <= 0) { break; }

            const nb = fromArray(nbs);
            list.push(nb);
            this.convertCell(nb);
        }

        this.cells = list;
    }

    convertCell(cell:Cell)
    {
        cell.setHole(true);
        cell.setType("tree");
    }

    getAllValidNeighbors(list:Cell[], grid:Cell[][])
    {
        const nbSet : Set<Cell> = new Set();
        for(const cell of list)
        {
            const nbs = cell.getValidNeighbors(grid);
            for(const nb of nbs)
            {
                if(nb.isHole()) { continue; }
                nbSet.add(nb)
            }
        }

        return Array.from(nbSet);
    }
}