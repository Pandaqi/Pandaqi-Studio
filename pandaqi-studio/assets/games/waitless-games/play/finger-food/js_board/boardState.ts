import Cell from "./cell";
import Point from "js/pq_games/tools/geometry/point";
import Random from "js/pq_games/tools/random/main";
import TypeManager from "./typeManager";
import CONFIG from "./config"
import RecipeBook from "./recipeBook";
import { NB_OFFSETS } from "./dictionary"
import Type from "./type";

export default class BoardState
{
    game: any
    grid: Cell[][]
    recipeBook: RecipeBook
    fail: boolean

    constructor(game:any)
    {
        this.game = game;
        this.createGrid();
    }

    countCells() { return this.getGridFlat().length; }
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
        const size = CONFIG.board.size;
        for(let x = 0; x < size.x; x++)
        {
            this.grid[x] = [];
            for(let y = 0; y < size.y; y++)
            {
                this.grid[x][y] = new Cell(x,y);
            }
        }
    }

    assignTypes(typeManager:TypeManager)
    {
        const numCells = this.countCells();
        typeManager.globalMaxPerType = Math.round(CONFIG.types.globalMaxPerType * numCells);

        let cellsLeft = Random.shuffle(this.getGridFlat());
        this.reserveSpaceForRecipeBook(cellsLeft);

        const numCellsLeft = cellsLeft.length;
        this.placeCells(cellsLeft, typeManager.getCellDistribution(numCellsLeft));
        this.addRecipeBook(typeManager);
    }

    placeCells(cellsToFill:Cell[], typesToPlace:Type[])
    {
        if(cellsToFill.length != typesToPlace.length) { 
            this.fail = true;
            return;
        }

        while(typesToPlace.length > 0)
        {
            const c = cellsToFill.pop();
            const t = typesToPlace.pop();
            c.setTypeObject(t);
        }
    }

    outOfBounds(point:Point)
    {
        const size = this.getDimensions();
        return (point.x < 0 || point.x >= size.x) || (point.y < 0 || point.y >= size.y);
    }

    // if it fails, it will return an empty array
    // otherwise, it returns the cells that were reserved/changed
    reserveSpace(anchorCell:Cell, size:Point)
    {
        const cellsReserved : Cell[] = [];
        for(let x = 0; x < size.x; x++)
        {
            for(let y = 0; y < size.y; y++)
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

    reserveSpaceForRecipeBook(cells:Cell[])
    {
        if(!CONFIG.expansions.recipeBook) { return; }

        const b = new RecipeBook();
        this.recipeBook = b;
        
        const size = this.getDimensions();
        const anchorCell = this.getCellAt(new Point(size.x - 2, size.y - 2));
        const recipeBookSize = new Point(2,2);
        
        const cellsReserved = this.reserveSpace(anchorCell, recipeBookSize);
        b.setReservedCells(cellsReserved);
        for(const cell of cellsReserved)
        {
            cells.splice(cells.indexOf(cell), 1);
        }
    }

    addRecipeBook(typeManager:TypeManager)
    {
        if(!CONFIG.expansions.recipeBook) { return; }
        this.recipeBook.createRecipes(typeManager);
    }

    getCellsOfType(tp:string) : Cell[]
    {
        const cells = this.getGridFlat();
        const arr = [];
        for(const cell of cells)
        {
            if(cell.subType != tp) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    getCellsAdjacent(cell:Cell) : Cell[]
    {
        const pos = cell.getPosition();
        const arr = [];
        for(const nbOffset of NB_OFFSETS)
        {
            const nbPos = pos.clone().move(nbOffset);
            const cell = this.getCellAt(nbPos);
            if(!cell) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    getCellsOnSameAxis(cell:Cell) : Cell[]
    {
        const pos = cell.getPosition();
        const cells = this.getGridFlat();
        const arr = [];
        for(const cell of cells)
        {
            if(cell.x != pos.x && cell.y != pos.y) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    getCellsWithProperty(p:string) : Cell[]
    {
        const cells = this.getGridFlat();
        const arr = [];
        for(const cell of cells)
        {
            const data = cell.getTypeData();
            if(!(p in data)) { continue; }
            if(!data[p]) { continue; }
            arr.push(cell);
        }
        return arr;
    }

}