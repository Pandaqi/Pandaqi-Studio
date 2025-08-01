import Cell from "./cell";
import Random from "js/pq_games/tools/random/main";
import TypeManager from "./typeManager"
import BoardHole from "./boardHole";
import BoardRiver from "./boardRiver";
import distributeDiscrete from "js/pq_games/tools/generation/distributeDiscrete";
import { CONFIG } from "./config"
import FloodFiller from "js/pq_games/tools/generation/floodFiller";
import range from "js/pq_games/tools/random/range";
import shuffle from "js/pq_games/tools/random/shuffle";

type command = number|string

export default class BoardState
{
    fail: boolean = false;
    game:any
    typeManager:TypeManager
    grid: Cell[][]
    longestSide:number
    shortestSide:number
    holes: BoardHole[]
    rivers: BoardRiver[]
    rowData: command[]
    columnData: command[]

    constructor(game:any)
    {
        this.game = game;
        
        this.createGrid();
        this.cutHolesOutOfGrid();
        this.growRivers();
        this.assignRowColumnCommands();

        this.typeManager = new TypeManager(this);
        this.assignTypes();
    }

    getIncludedTypes() { return this.typeManager.getPossibleTypes(); }
    getDimensions() { return CONFIG.board.sizePerSize[CONFIG.boardSize]; }
    getGrid() { return this.grid; }
    getGridFlat() { return this.grid.flat(); }
    getNumCells() { return this.getGridFlat().length; }
    getCellAt(point) { 
        if(this.outOfBounds(point)) { return null; }
        return this.grid[point.x][point.y]; 
    }
    outOfBounds(point)
    {
        const size = this.getDimensions();
        return (point.x < 0 || point.x >= size.x) || (point.y < 0 || point.y >= size.y);
    }
    
    createGrid()
    {
        this.grid = [];
        const size = this.getDimensions();
        for(let x = 0; x < size.x; x++)
        {
            this.grid[x] = [];
            for(let y = 0; y < size.y; y++)
            {
                const c = new Cell(x,y);
                c.setEdgeName(this.getEdgeName(c));
                this.grid[x][y] = c;
            }
        }

        this.longestSide = Math.max(size.x, size.y);
        this.shortestSide = Math.min(size.x, size.y);
    }

    getEdgeName(cell)
    {
        const size = this.getDimensions();
        if(cell.x <= 0) { return "left"; }
        if(cell.x >= (size.x-1)) { return "right"; }
        if(cell.y <= 0) { return "top"; }
        if(cell.y >= (size.y-1)) { return "bottom"; }
        return null;
    }

    getCellsPerEdgeType()
    {
        var dict : Record<string, Cell[]> = {};
        var cells = this.getGridFlat();
        for(const cell of cells)
        {
            const type = cell.getEdgeName() ?? "inside";
            if(!dict[type]) { dict[type] = [] }
            dict[type].push(cell);
        }
        return dict
    }
    
    cutHolesOutOfGrid()
    {
        this.holes = []
        if(!CONFIG.board.holes.enable) { return; }

        const numHoleCells = Math.round(CONFIG.board.holes.percentageOfBoard * this.getNumCells())
        var totalHoleCells = 0
        const bounds = CONFIG.board.holes.sizeBounds;

        var dict = this.getCellsPerEdgeType();
        for(const cellList of Object.values(dict))
        {
            Random.shuffle(cellList);
        }

        var types = Object.keys(dict);
        Random.shuffle(types);

        var startingCell
        var curTypeIndex = 0;
        while(totalHoleCells < numHoleCells)
        {
            const curType = types[curTypeIndex];
            startingCell = dict[curType].pop();
            if(startingCell.isHole()) { continue; }

            curTypeIndex = (curTypeIndex + 1) % types.length

            var hole = new BoardHole()
            hole.grow(startingCell, this.grid, bounds)
            totalHoleCells += hole.count()
            this.holes.push(hole);
        }
    }

    getNonEdgeCells()
    {
        var list = [];
        var cells = this.getGridFlat();
        for(const cell of cells)
        {
            if(cell.onEdge()) { continue; }
            list.push(cell);
        }
        return list;
    }

    getEdgeCells()
    {
        var list = [];
        var cells = this.getGridFlat();
        for(const cell of cells)
        {
            if(!cell.onEdge()) { continue; }
            list.push(cell);
        }
        return list;
    }

    growRivers()
    {
        this.rivers = [];
        if(!CONFIG.board.rivers.enable) { return; }

        const riverConfig = CONFIG.board.rivers;
        const numRiverPercentage = Random.range(riverConfig.percentageBounds.min, riverConfig.percentageBounds.max);
        const numRiverCells = Math.round(numRiverPercentage * this.getNumCells());

        var bounds = structuredClone(CONFIG.board.rivers.sizeBounds);
        bounds.min = 1;
        bounds.max = Math.ceil(1.3 * this.longestSide);

        const edgeCells = this.getEdgeCells();
        Random.shuffle(edgeCells);
        var startingCell = edgeCells.pop();

        var river = new BoardRiver();
        var crossMap = true
        
        river.flow(startingCell, this.grid, bounds, crossMap);
        if(river.isEmpty()) { 
            this.fail = true;
            return console.error("Impossible to create cross map river on this board"); 
        }

        this.rivers.push(river);

        const mainRiverCells = river.getCells();
        Random.shuffle(mainRiverCells);

        bounds = structuredClone(CONFIG.board.rivers.sizeBounds);
        bounds.min = Math.ceil(bounds.min * this.longestSide);
        bounds.max = Math.ceil(bounds.max * this.longestSide);

        crossMap = false;
        var totalRiverCells = river.count();
        while(totalRiverCells < numRiverCells)
        {
            startingCell = mainRiverCells.pop();
            
            var river = new BoardRiver();
            river.flow(startingCell, this.grid, bounds, crossMap);
            totalRiverCells += river.count();
            if(river.isEmpty()) { continue; }
            this.rivers.push(river);
        }
    }

    assignRowColumnCommands()
    {
        const size = this.getDimensions();

        let numbersAxis = CONFIG.board.numbers.axis;
        if(CONFIG.board.randomizeAxes)
        {
            numbersAxis = Math.random() <= 0.5 ? "column" : "row"
        }

        const columnHasNumbers = numbersAxis == "column"
        const numsCount = columnHasNumbers ? size.x : size.y;
        const nums = this.getRandomNumbers(numsCount);
        const dirsCount = (numsCount == size.x) ? size.y : size.x;
        const dirs = this.getRandomDirs(dirsCount);

        this.columnData = columnHasNumbers ? nums : dirs;
        this.rowData = (this.columnData == nums) ? dirs : nums;
    }

    getRandomNumbers(num)
    {
        var allNumbers = []
        var bounds = CONFIG.board.numbers.bounds
        for(let i = bounds.min; i <= bounds.max; i++)
        {
            allNumbers.push(i);
        }

        var list = [];
        while(list.length < num)
        {
            list = list.concat(allNumbers);
        }

        Random.shuffle(list);
        return list;
    }

    getRandomDirs(num)
    {
        var allDirs = CONFIG.board.dirs.options.slice();
        var list = [];
        while(list.length < num)
        {
            list = list.concat(allDirs);
        }

        Random.shuffle(list);
        return list;
    }

    getCellsWaitingForType()
    {
        const cells = this.getGridFlat();
        const arr = [];
        for(const cell of cells)
        {
            if(cell.isHole()) { continue; }
            if(cell.isRiver()) { continue; }
            if(cell.hasType()) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    getCellsOfType(tp)
    {
        const cells = this.getGridFlat();
        const arr = [];
        for(const cell of cells)
        {
            if(cell.getType() != tp) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    assignTypes()
    {
        this.typeManager.drawRandomTypes();

        // this simply assigns the correct cell types everywhere
        const cells = this.getCellsWaitingForType();
        const list = this.typeManager.getFullTypeList(cells.length);
        for(const cell of cells)
        {
            const tp = list.pop();
            cell.setType(tp);
        }

        // now some cells need special treatment
        // > score cells need numbers (which should be high enough, in total, to make the game balanced)
        const scoreCells = this.getCellsOfType("score");
        shuffle(scoreCells);
        
        const numScoreCells = scoreCells.length;
        const scoreBounds = CONFIG.types.scoreBounds;
        const desiredAvailableScore = Random.rangeInteger(scoreBounds.min, scoreBounds.max);
        const distribution = distributeDiscrete(desiredAvailableScore, numScoreCells);

        const negBounds = CONFIG.negativeScoreBounds;
        const numNegativeCells = CONFIG.allowNegativePoints ? Math.round(range(negBounds) * numScoreCells) : 0;

        let counter = 0;
        for(const cell of scoreCells)
        {
            let num = distribution.pop();
            if(counter < numNegativeCells) { num *= -1; }
            cell.setNum(num);
            counter++;
        }

        // > echidna need numbers that are ASCENDING
        const echidnaCells = this.getCellsOfType("echidna");
        const numEchidnaCells = echidnaCells.length;
        Random.shuffle(echidnaCells);
        for(let i = 0; i < numEchidnaCells; i++)
        {
            const num = (i + 1);
            echidnaCells[i].setNum(num);
        }

    }

    getCellsWithProperty(prop:string) : Cell[]
    {
        const arr = [];
        for(const cell of this.getGridFlat())
        {
            const data = cell.getData();
            if(!data[prop]) { continue; }
            arr.push(cell);
        }
        return arr;
    }

    getQuadrantForCell(cell:Cell) : number
    {
        const size = this.getDimensions();
        if(cell.x < 0.5*size.x)
        {
            if(cell.y < 0.5*size.y) { return 0; }
            return 1;
        }
        else
        {
            if(cell.y < 0.5*size.y) { return 2; }
            return 3;
        }
    }

    // Groups anything with a type (not a hole)
    // If multiple of these must be created, then it means we have unreachable sections on the board
    getConnectedReachableGroups() : FloodFiller<Cell>[]
    {
        const cells = this.getGridFlat();
        const cellsHandled : Cell[] = [];
        const groups = [];

        const filter = (a,b) => {
            return !b.isHole();
        }

        for(const cell of cells)
        {
            if(cell.isHole()) { continue; }
            if(cellsHandled.includes(cell)) { continue; }

            const group = new FloodFiller();
            group.grow({
                start: cell, 
                grid: this.grid, 
                filter: filter
            });

            for(const cellHandled of group.get())
            {
                cellsHandled.push(cellHandled as Cell);
            }
            
            groups.push(group);
        }

        return groups;
    }

    // Groups all holes together, ignores any other cells
    getHoleClumps() : FloodFiller<Cell>[]
    {
        const cells = this.getGridFlat();
        const cellsHandled : Cell[] = [];
        const clumps = [];

        // if this is true, something is considered a valid neighbor that should be added
        // (the `a` parameter is the original cell that is searching its neighbors, not relevant here)
        const callback = (a,b) => {
            return b.isHole();
        }

        for(const cell of cells)
        {
            if(!cell.isHole()) { continue; }
            if(cellsHandled.includes(cell)) { continue; }

            const clump = new FloodFiller();
            clump.grow({
                start: cell, 
                grid: this.grid, 
                filter: callback
            });

            for(const cellHandled of clump.get())
            {
                cellsHandled.push(cellHandled as Cell);
            }
            
            clumps.push(clump);
        }
        return clumps;
    }

    getTypesWithProperty(prop:string) : string[]
    {
        const cells = this.getCellsWithProperty(prop);
        const types : Set<string> = new Set();
        for(const cell of cells)
        {
            types.add(cell.getType());
        }
        return Array.from(types);
    }

    getDistToEdge(cell:Cell) : number
    {
        const size = this.getDimensions();
        const xMin = Math.min(cell.x, size.x - 1 - cell.x);
        const yMin = Math.min(cell.y, size.y - 1 - cell.y);
        return Math.min(xMin, yMin);
    }
}

