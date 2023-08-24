import Cell from "./cell";
import Point from "js/pq_games/tools/geometry/point";
import Random from "js/pq_games/tools/random/main";

export default class BoardState
{
    constructor(game)
    {
        this.game = game;
        this.cfg = this.game.cfg;
        this.cfgBoard = this.cfg.board;
        
        this.createGrid();
    }

    getDimensions() { return { x: this.grid.length, y: this.grid[0].length}; }
    getGrid() { return this.grid; }
    getGridFlat() { return this.grid.flat(); }
    getCellAt(point) { 
        if(this.outOfBounds(point)) { return null; }
        return this.grid[point.x][point.y]; 
    }
    outOfBounds(point)
    {
        const dims = this.getDimensions();
        return (point.x < 0 || point.x >= dims.x) || (point.y < 0 || point.y >= dims.y);
    }
    
    createGrid()
    {
        this.grid = [];
        const dims = this.cfgBoard.dims;
        for(let x = 0; x < dims.x; x++)
        {
            this.grid[x] = [];
            for(let y = 0; y < dims.y; y++)
            {
                this.grid[x][y] = new Cell(x,y);
            }
        }
    }

    assignTypes(typeManager)
    {
        // @TODO
    }


    

}