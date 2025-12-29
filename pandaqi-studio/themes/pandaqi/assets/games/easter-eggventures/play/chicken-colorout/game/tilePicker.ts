import { rangeInteger, shuffle, getWeighted, Vector2, Rectangle } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { REQUIREMENTS, SPECIAL_SCORE_RULES, SlotRequirement, TILES, TileCustomData, TileGridCell, TileType } from "../shared/dict";
import Tile from "./tile";

export const tilePicker = () : Tile[] =>
{
    const tiles = [];

    generatePawns(tiles);
    generateBaseMapTiles(tiles);
    generateTerrificMapTiles(tiles);

    return tiles;
}

const generatePawns = (tiles) =>
{
    if(CONFIG._settings.sets.base.value)
    {
        // the crucial required seeker pawn
        tiles.push(new Tile(TileType.PAWN, "seeker"));
    }

    if(CONFIG._settings.sets.pawns.value)
    {
        const maxNumPlayers = CONFIG.generation.maxNumPlayers ?? 6;
        for(let i = 0; i < maxNumPlayers; i++)
        {
            tiles.push(new Tile(TileType.PAWN, "", { playerNum: i }));
        }
    }
}

const generateRandomSlotRequirement = (type:string, options:Record<string,any>) : SlotRequirement[] =>
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
            const option = options.pop() as string;
            list.push({ texture: data.multiSpriteKey, frame: data.multiSpriteDict[option].frame });
        }
    } else {
        const obj = { texture: "requirements", frame: data.frame, arrow: null };
        if(data.arrow) { obj.arrow = rangeInteger(0,3); }
        list.push(obj);
    }

    return list;
}

const generateBaseMapTiles = (tiles) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }

    // the crucial required starter tile
    tiles.push(new Tile(TileType.MAP, "starter", { num: 0 }));

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
        let customData = { slotType: type, slotReq: generateRandomSlotRequirement(type, slotOptions), grid: null };
        fillTileGrid(customData);
        tiles.push(new Tile(TileType.MAP, "", customData));
    }
}

const generateTerrificMapTiles = (tiles) =>
{
    if(!CONFIG._settings.sets.score.value) { return; }

    // add some more starter tile options
    for(let i = 0; i < CONFIG.generation.numExtraStarterTiles; i++)
    {
        tiles.push(new Tile(TileType.MAP, "starter", { num: (i+1) }))
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
        let customData = { scoringRule: scoringRules[counter], slotReq: generateRandomSlotRequirement(type, slotOptions), grid: null, slotType: type };
        fillTileGrid(customData);
        tiles.push(new Tile(TileType.MAP, "", customData));
        counter = (counter + 1) % scoringRules.length;
    }
}

const placeSquareInGrid = (grid:TileGridCell[][], size:Vector2) =>
{
    const maxAllowedX = grid.length - size.x;
    const maxAllowedY = grid[0].length - size.y;

    const allValidPositions = [];
    for(let x = 0; x <= maxAllowedX; x++)
    {
        for(let y = 0; y <= maxAllowedY; y++)
        {
            if(grid[x][y].used) { continue; }
            allValidPositions.push(new Vector2(x,y));
        }
    }
    shuffle(allValidPositions);

    let validPos = false;
    let anchor : Vector2;
    let cells : TileGridCell[] = [];

    while(!validPos && allValidPositions.length > 0)
    {
        validPos = true;
        anchor = allValidPositions.pop();

        // @IMPROV: does this need to be reversed (y first, x second) for left to right reading??
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
        anchor = Vector2.ZERO.clone(); 
        console.error("Couldn't place square in grid.");
    }

    return { anchor, cells };
}

const getUnusedCells = (grid:TileGridCell[][]) =>
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

const getUnusedNeighborsOf = (grid:TileGridCell[][], cells:TileGridCell[]) =>
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

const randomWalkThroughGrid = (grid:TileGridCell[][], maxLength: number = 6) =>
{
    const unusedCells = getUnusedCells(grid);
    const startingCell = shuffle(unusedCells).pop();

    const cells : TileGridCell[] = [startingCell];
    while(cells.length < maxLength)
    {
        const nbs = getUnusedNeighborsOf(grid, cells);
        if(nbs.length <= 0) { break; }

        const nb = shuffle(nbs).pop();
        cells.push(nb);
    }

    return cells;
}

const fillTileGrid = (data:TileCustomData) =>
{
    // initialize the grid
    const size = CONFIG.generation.grid.size;
    const grid = [];
    for(let x = 0; x < size.x; x++)
    {
        grid[x] = [];
        for(let y = 0; y < size.y; y++)
        {
            grid[x][y] = { pos: new Vector2(x,y), used: false, type: "" };
        }
    }
    data.grid = grid;

    // place the slot requirements
    if(data.slotReq)
    {
        const squaresNeeded = data.slotReq.length;
        const square = Math.random() <= 0.5 ? new Vector2(squaresNeeded, 1) : new Vector2(1, squaresNeeded);
        const { anchor, cells } = placeSquareInGrid(grid, square);
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
        const { anchor, cells } = placeSquareInGrid(grid, square);

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
    const cells = randomWalkThroughGrid(grid, numSlots);
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
        const square = TILES[randKey].size == "large" ? new Vector2(2,2) : new Vector2(1,1);
        const { anchor, cells } = placeSquareInGrid(grid, square);
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