
import { Vector2 } from "lib/pq-games";
import Cell from "./cell";

export default class BoardState
{
    grid: Cell[][]
    cells: Cell[]
    size: Vector2;
    uniqueTypes: string[];
    startingPositions: Cell[];

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
        this.startingPositions = [];

        const types : Set<string> = new Set();
        for(const cell of this.cells)
        {
            for(const icon of cell.icons)
            {
                if(icon == undefined) { console.log("BAD CELL", cell); }
                types.add(icon);
            }

            if(cell.isStartingPosition()) { this.startingPositions.push(cell); }
        }
        this.uniqueTypes = Array.from(types);
    }
}