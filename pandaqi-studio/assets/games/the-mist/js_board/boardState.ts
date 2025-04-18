import Point from "js/pq_games/tools/geometry/point";
import Cell from "./cell";

export default class BoardState
{
    grid: Cell[][]
    cells: Cell[]
    size: Point;
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
        this.size = new Point(this.grid.length, this.grid[0].length);
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