
import { Vector2 } from "lib/pq-games";
import Cell from "./cell";

export default class BoardState
{
    grid: Cell[][]
    cells: Cell[]
    size: Vector2;
    uniqueTypes: string[];

    fromGrid(grid:Cell[][])
    {
        this.grid = grid;
        this.cells = this.grid.flat();
        this.refresh();
        return this;
    }

    refresh()
    {
        this.size = new Vector2(this.grid.length, this.grid[0].length);
        
        const types : Set<string> = new Set();
        for(const cell of this.cells)
        {
            types.add(cell.type);
        }
        this.uniqueTypes = Array.from(types);
    }
}