import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { REQUIREMENTS, SPECIAL_SCORE_RULES, SlotRequirement, TILES, TileCustomData, TileGridCell, TileType } from "../js_shared/dict";
import Tile from "./tile";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";

export default class TilePicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];

        this.generatePawns();
        this.generateBaseMapTiles();
        this.generateTerrificMapTiles();

        console.log(this.tiles);
    }

    generatePawns()
    {
        if(CONFIG.sets.base)
        {
            // the crucial required seeker pawn
            this.tiles.push(new Tile(TileType.PAWN, "seeker"));
        }

        if(CONFIG.sets.pawns)
        {
            const maxNumPlayers = CONFIG.generation.maxNumPlayers ?? 6;
            for(let i = 0; i < maxNumPlayers; i++)
            {
                this.tiles.push(new Tile(TileType.PAWN, "", { playerNum: i }));
            }
        }
    }

    generateRandomSlotRequirement(type:string, options:Record<string,any>) : SlotRequirement[]
    {
        const invert = Math.random() <= CONFIG.generation.requirementNegationProb;
        const data = options[type];

        const list = [];
        if(invert)
        {
            list.push({ texture: "requirements", frame: CONFIG.generation.requirementNegationFrame });
        }

        const canTakeMultiple = data.multiSpriteKey && data.multiSpriteOptions && data.multiSpriteDict;
        if(canTakeMultiple) {
            const num = rangeInteger(1,3);
            const options = shuffle(data.multiSpriteOptions.slice());
            for(let i = 0; i < num; i++)
            {
                const option = options.pop();
                list.push({ texture: data.multiSpriteKey, frame: data.multiSpriteDict[option].frame });
            }
        } else {
            const obj = { texture: "requirements", frame: data.frame, arrow: null };
            if(data.arrow) { obj.arrow = rangeInteger(0,3); }
            list.push(obj);
        }

        return list;
    }

    generateBaseMapTiles()
    {
        if(!CONFIG.sets.base) { return; }

        // the crucial required starter tile
        this.tiles.push(new Tile(TileType.MAP, "starter", { num: 0 }));

        // get our possible slot requirements
        const slotOptions = {};
        for(const [key,data] of Object.entries(REQUIREMENTS))
        {
            const set = data.set ?? "base";
            if(set != "base") { continue; }
            slotOptions[key] = data;
        }

        const numTiles = CONFIG.generation.numMapTiles.base;
        for(let i = 0; i < numTiles; i++)
        {
            const type = getWeighted(slotOptions);
            let customData = { slotType: type, slotReq: this.generateRandomSlotRequirement(type, slotOptions), grid: null };
            this.fillTileGrid(customData);
            this.tiles.push(new Tile(TileType.MAP, "", customData));
        }
    }

    generateTerrificMapTiles()
    {
        if(!CONFIG.sets.score) { return; }

        // add some more starter tile options
        for(let i = 0; i < CONFIG.generation.numExtraStarterTiles; i++)
        {
            this.tiles.push(new Tile(TileType.MAP, "starter", { num: (i+1) }))
        }

        // get our possible slot requirements
        const slotOptions = {};
        for(const [key,data] of Object.entries(REQUIREMENTS))
        {
            const set = data.set ?? "base";
            if(set != "tiles") { continue; }
            slotOptions[key] = data;
        }

        // get our possible scoring rules
        const scoringRules = Object.keys(SPECIAL_SCORE_RULES);
        shuffle(scoringRules);

        let counter = 0;
        const numTiles = CONFIG.generation.numMapTiles.terrific;
        for(let i = 0; i < numTiles; i++)
        {
            const type = getWeighted(slotOptions);
            let customData = { scoringRule: scoringRules[counter], slotReq: this.generateRandomSlotRequirement(type, slotOptions), grid: null, slotType: type };
            this.fillTileGrid(customData);
            this.tiles.push(new Tile(TileType.MAP, "", customData));
            counter = (counter + 1) % scoringRules.length;
        }
    }

    placeSquareInGrid(grid:TileGridCell[][], size:Point)
    {
        const maxAllowedX = grid.length - size.x;
        const maxAllowedY = grid[0].length - size.y;

        const allValidPositions = [];
        for(let x = 0; x <= maxAllowedX; x++)
        {
            for(let y = 0; y <= maxAllowedY; y++)
            {
                if(grid[x][y].used) { continue; }
                allValidPositions.push(new Point(x,y));
            }
        }
        shuffle(allValidPositions);

        let validPos = false;
        let anchor : Point;
        let cells : TileGridCell[] = [];

        while(!validPos && allValidPositions.length > 0)
        {
            validPos = true;
            anchor = allValidPositions.pop();

            // @TODO: does this need to be reversed (y first, x second) for left to right reading??
            cells = [];
            for(let x = 0; x < size.x; x++)
            {
                for(let y = 0; y < size.y; y++)
                {
                    const cell = grid[anchor.x + x][anchor.y + y];
                    if(cell.used) { validPos = false; break; }
                    cells.push(cell);
                }

                if(!validPos) { break; }
            }
        }
        
        if(!validPos) 
        { 
            cells = []; 
            anchor = new Point(); 
            console.error("Couldn't place square in grid.");
        }

        return { anchor, cells };
    }

    getUnusedCells(grid:TileGridCell[][])
    {
        const arr = [];
        for(let x = 0; x < grid.length; x++)
        {
            for(let y = 0; y < grid[0].length; y++)
            {
                const cell = grid[x][y];
                if(cell.used) { continue; }
                arr.push(cell);
            }
        }
        return arr;
    }

    getUnusedNeighborsOf(grid:TileGridCell[][], cells:TileGridCell[])
    {
        const arr = [];

        for(let x = 0; x < grid.length; x++)
        {
            for(let y = 0; y < grid[0].length; y++)
            {
                const cell = grid[x][y];

                // already part of random walk/set, so ignore
                if(cells.includes(cell)) { continue; }

                // used, obviously ignore
                if(cell.used) { continue; }

                // now just check if we are a neighbor of the given set
                // (our distance of X and Y summed should be exactly 1; more than 1 means diagonal; 0 means it's the exact same cell)
                for(const tempCell of cells)
                {
                    if(Math.abs(tempCell.pos.x - x) + Math.abs(tempCell.pos.y - y) == 1)
                    {
                        arr.push(cell);
                    }
                }
            }
        }

        return arr;
    }

    randomWalkThroughGrid(grid:TileGridCell[][], maxLength: number = 6)
    {
        const unusedCells = this.getUnusedCells(grid);
        const startingCell = shuffle(unusedCells).pop();

        const cells = [startingCell];
        while(cells.length < maxLength)
        {
            const nbs = this.getUnusedNeighborsOf(grid, cells);
            if(nbs.length <= 0) { break; }

            const nb = shuffle(nbs).pop();
            cells.push(nb);
        }

        return cells;
    }

    fillTileGrid(data:TileCustomData)
    {
        // initialize the grid
        const dims = CONFIG.generation.grid.dims;
        const grid = [];
        for(let x = 0; x < dims.x; x++)
        {
            grid[x] = [];
            for(let y = 0; y < dims.y; y++)
            {
                grid[x][y] = { pos: new Point(x,y), used: false, type: "" };
            }
        }
        data.grid = grid;

        // place the slot requirements
        if(data.slotReq)
        {
            const squaresNeeded = data.slotReq.length;
            const square = Math.random() <= 0.5 ? new Point(squaresNeeded, 1) : new Point(1, squaresNeeded);
            const { anchor, cells } = this.placeSquareInGrid(grid, square);
            for(let i = 0; i < cells.length; i++)
            {
                const cell = cells[i];
                cell.used = true;
                cell.type = "req";
                cell.index = i;
            }
    
            data.slotReqRect = new Rectangle().fromTopLeft(anchor, square);
        }

        // if needed, place the score text
        // (this doesn't actually FILL the squares with anything specific, it just marks them as used)
        if(data.scoringRule)
        {
            const square = CONFIG.generation.grid.squaresNeededForText.clone();
            const { anchor, cells } = this.placeSquareInGrid(grid, square);

            for(const cell of cells)
            {
                cell.used = true;
            }
    
            data.scoringRuleRect = new Rectangle().fromTopLeft(anchor, square);
        }

        // decide on the number of egg slots
        let numSlots = parseInt( getWeighted(CONFIG.generation.numEggSlotDistribution) );
        if(REQUIREMENTS[data.slotType].forbidSingleSlot && numSlots == 1) { numSlots = 2; }

        // then do a random walk to add the slots
        const cells = this.randomWalkThroughGrid(grid, numSlots);
        for(const cell of cells)
        {
            cell.used = true;
            cell.type = "slot";
        }


        // finally sprinkle some decorations (if possible)
        const numDecorations = CONFIG.generation.numDecorationBounds.randomInteger();
        for(let i = 0; i < numDecorations; i++)
        {
            const randKey = getWeighted(TILES);
            const square = TILES[randKey].size == "large" ? new Point(2,2) : new Point(1,1);
            const { anchor, cells } = this.placeSquareInGrid(grid, square);
            for(let i = 0; i < cells.length; i++)
            {
                const cell = cells[i];
                cell.used = true;

                // only the first (top-left anchor) cell actually knows and displays the sprite for large ones
                if(i == 0)
                {
                    cell.type = "dec";
                    cell.key = randKey;
                }
            }
        }
    }

}