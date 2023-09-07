import Cell from "./cell";
import Point from "js/pq_games/tools/geometry/point";
import Random from "js/pq_games/tools/random/main";
import TypeManager from "./typeManager";
import CONFIG from "./config"

export default class BoardState
{
    game: any
    grid: Cell[][]

    constructor(game:any)
    {
        this.game = game;
        this.createGrid();
    }

    getDimensions() { return new Point({ x: this.grid.length, y: this.grid[0].length}); }
    getGrid() { return this.grid; }
    getGridFlat() { return this.grid.flat(); }
    getCellAt(point:Point) { 
        if(this.outOfBounds(point)) { return null; }
        return this.grid[point.x][point.y]; 
    }
    createGrid()
    {
        this.grid = [];
        const dims = CONFIG.board.dims;
        for(let x = 0; x < dims.x; x++)
        {
            this.grid[x] = [];
            for(let y = 0; y < dims.y; y++)
            {
                this.grid[x][y] = new Cell(x,y);
            }
        }
    }

    assignTypes(typeManager:TypeManager)
    {
        let cellsLeft = Random.shuffle(this.getGridFlat());
        this.placeTutorials(typeManager, cellsLeft);
        this.placeRequired(typeManager, cellsLeft);
        this.fillSpaceLeft(typeManager, cellsLeft);

        console.log(this.getGridFlat());
    }

    placeTutorials(typeManager:TypeManager, cells:Cell[])
    {
        const tutorials = typeManager.getTutorialsNeeded();
        while(tutorials.length > 0)
        {
            const t = tutorials.pop();
            const c = cells.pop();
            c.setTypeObject(t);
        }
        return cells;
    }

    placeRequired(typeManager:TypeManager, cells:Cell[])
    {
        const required = typeManager.getRequiredTypes();
        while(required.length > 0)
        {
            const r = required.pop();
            const c = cells.pop();
            c.setTypeObject(r);
            typeManager.registerTypeChosen(c, r);
        }

        const requiredMoney = typeManager.getRequiredMoney();
        while(requiredMoney.length > 0)
        {
            const r = requiredMoney.pop();
            const c = cells.pop();
            c.setTypeObject(r);
            typeManager.registerTypeChosen(c, r);
        }
    }

    fillSpaceLeft(typeManager:TypeManager, cells:Cell[])
    {
        while(cells.length > 0)
        {
            const c = cells.pop();
            // @TODO: Bug, this returns a type string, while we want an object
            // Replace with functionality entirely on typeManager that handles this?
            const possibleTypes = typeManager.getPossibleTypes();
            const typeKey = Random.getWeighted(possibleTypes, "prob");
            const typeObject = possibleTypes[typeKey].typeObject
            c.setTypeObject(typeObject);
            typeManager.registerTypeChosen(c, typeObject);
        }
    }

    outOfBounds(point:Point)
    {
        const dims = this.getDimensions();
        return (point.x < 0 || point.x >= dims.x) || (point.y < 0 || point.y >= dims.y);
    }

    // if it fails, it will return an empty array
    // otherwise, it returns the cells that were reserved/changed
    reserveSpace(anchorCell:Cell, dims:Point)
    {
        const cellsReserved = [];
        for(let x = 0; x < dims.x; x++)
        {
            for(let y = 0; y < dims.y; y++)
            {
                const point = new Point().setXY(anchorCell.x + x, anchorCell.y + y);
                const cell = this.getCellAt(point);
                if(!cell) { return []; }

                const cellAlreadyUsed = cell.isUsed();
                if(cellAlreadyUsed) { return []; }

                cellsReserved.push(cell);
            }
        }

        for(const cell of cellsReserved)
        {
            cell.markReservedFor(anchorCell);
        }

        return cellsReserved
    }

}