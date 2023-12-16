import Point from "js/pq_games/tools/geometry/point";
import Cell from "./cell";

export default class BoardState
{
    grid: Cell[][]
    cells: Cell[]
    dims: Point;
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
        this.dims = new Point(this.grid.length, this.grid[0].length);
        
        const types : Set<string> = new Set();
        for(const cell of this.cells)
        {
            for(const icon of cell.icons)
            {
                if(icon == undefined) { console.log("BAD CELL", cell); }
                types.add(icon);
            }
        }
        this.uniqueTypes = Array.from(types);
    }
}