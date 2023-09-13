import Cell from "./cell"
import Point from "js/pq_games/tools/geometry/point"
import CONFIG from "./config"

export default class BoardState
{
    grid: Cell[][];
    gridFlat: Cell[];
    size: Point;

    constructor() {}
    clone()
    {
        const state = new BoardState();
        state.cloneGrid(this.grid);
        return state;
    }

    countCells() { return this.getGridFlat().length; }
    getGridFlat() { return this.gridFlat.slice(); }
    createGrid()
    {
        const grid = [];
        const dims = CONFIG.board.dims;
        this.size = dims;
        for(let x = 0; x < dims.x; x++)
        {
            grid[x] = [];
            for(let y = 0; y < dims.y; y++)
            {
                const c = new Cell(x, y);
                c.setEdge(this.isEdgeCell(c));
                grid[x][y] = c;
            }
        }

        this.grid = grid;
        this.gridFlat = grid.flat();
    }

    // @TODO: a bit of repetition with the function above, write smarter?
    cloneGrid(grid:Cell[][])
    {
        const newGrid = [];
        const dims = new Point(grid.length, grid[0].length);
        this.size = dims;
        for(let x = 0; x < dims.x; x++)
        {
            newGrid[x] = [];
            for(let y = 0; y < dims.y; y++)
            {
                newGrid[x][y] = grid[x][y].clone();
            }
        }

        this.grid = newGrid;
        this.gridFlat = newGrid.flat();
    }

    isEdgeCell(c:Cell)
    {
        return c.x == 0 || c.x == (this.size.x-1) || c.y == 0 || c.y == (this.size.y-1)
    }

    getCenterCell()
    {
        const cX = Math.floor(0.5 * this.size.x);
        const cY = Math.floor(0.5 * this.size.y);
        return this.grid[cX][cY];
    }

    getCellOffset(c, offset)
    {
        const newPos = new Point({ x: c.x + offset.x, y: c.y + offset.y });
        if(this.outOfBounds(newPos)) { return null; }
        return this.grid[newPos.x][newPos.y];
    }

    outOfBounds(pos)
    {
        return pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y
    }

    getBlankCells()
    {
        const cells = this.getGridFlat();
        const list = [];
        for(const cell of cells)
        {
            if(!cell.isEmpty()) { continue; }
            list.push(cell);
        }
        return list;
    }

    getCellsOfType(type)
    {
        const cells = this.getGridFlat();
        const list = [];
        for(const cell of cells)
        {
            if(cell.getType() != type) { continue; }
            list.push(cell);
        }
        return list;
    }

    getRandomCell(cells, params)
    {
        for(const c of cells)
        {
            if(params.forbidEdgeSelf && c.isEdge()) { continue; }

            const nbs = this.getNeighbors(c, params);
            if(nbs.length <= 0) { continue; }
            return c;
        }
        return null;
    }

    getDirFromRotation(rot)
    {
        if(rot < 0 || rot >= 4) { return null; }
        return this.getAllDirs()[rot];
    }

    getAllDirs()
    {
        return [
            new Point().setXY(1,0),
            new Point().setXY(0,1),
            new Point().setXY(-1,0),
            new Point().setXY(0,-1)
        ]
    }

    getNeighbors(c:Cell, params:Record<string,any> = {})
    {
        
        const nbs = this.getAllDirs();
        const list = [];
        for(const nb of nbs)
        {
            const pos = new Point({ x: c.x, y: c.y }).add(nb);
            if(this.outOfBounds(pos)) { continue; }

            const nbCell = this.grid[pos.x][pos.y];
            if(params.empty && !nbCell.isEmpty()) { continue; }
            if(params.forbidEdge && nbCell.isEdge()) { continue; }
            if(params.type && nbCell.getType() != params.type) { continue; }

            list.push(nbCell);
        }
        return list;
    }

    getCellsInDirection(cell:Cell, params:Record<string,any> = {})
    {
        const rot = cell.getRotation();
        const dirs = [this.getDirFromRotation(rot)];
        if(params.bidirectional)
        {
            const oppositeRot = (rot + 2) % 4;
            dirs.push(this.getDirFromRotation(oppositeRot));
        }

        const set = new Set();
        for(const dir of dirs)
        {
            let curCell = cell;
            while(curCell)
            {
                set.add(curCell);
                curCell = this.getCellOffset(curCell, dir);
            }
        }

        const list = Array.from(set);
        if(params.removeSelf) { list.splice(list.indexOf(cell), 1); }
        return list;
    }

    getGroupOfType(cell:Cell, type:string)
    {
        const cellsToEvaluate = [cell];
        const cellsEvaluated = [];
        while(cellsToEvaluate.length > 0)
        {
            const c = cellsToEvaluate.pop();
            const nbs = this.getNeighbors(c, { type: type });
            for(const nb of nbs)
            {
                const alreadyHandled = cellsEvaluated.includes(nb);
                if(alreadyHandled) { continue; }

                cellsToEvaluate.push(nb);
            }
            cellsEvaluated.push(c);
        }

        return cellsEvaluated;
    }

    getCellsSameRow(cell:Cell)
    {
        const allCells = this.getGridFlat();
        const arr = [];
        for(const otherCell of allCells)
        {
            if(otherCell.x != cell.x) { continue; }
            arr.push(otherCell);
        }
        return arr;
    }

    getCellsSameColumn(cell:Cell)
    {
        const allCells = this.getGridFlat();
        const arr = [];
        for(const otherCell of allCells)
        {
            if(otherCell.y != cell.y) { continue; }
            arr.push(otherCell);
        }
        return arr;
    }

    // @TODO: should be much smarter, and generalizable to other team nums?
    getClosestPlayer(cell:Cell)
    {
        const dist0 = this.size.y - 1 - cell.y;
        const dist1 = cell.y;
        if(dist0 == dist1) { return -1; }
        if(dist0 < dist1) { return 0; }
        return 1;
    }

    // @TODO: also generalize to different tema counts?
    getPlayerPointedAtBy(cell:Cell)
    {
        const rot = cell.getRotation();
        if(rot == 1) { return 0; }
        else if(rot == 3) { return 1; }
        return -1;
    }
}