import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import TilePicker from "../js_game/tilePicker";
import shuffle from "js/pq_games/tools/random/shuffle";
import fromArray from "js/pq_games/tools/random/fromArray";
import Point from "js/pq_games/tools/geometry/point";
import Tile from "../js_game/tile";
import CONFIG from "../js_shared/config";
import range from "js/pq_games/tools/random/range";
import createContext from "js/pq_games/layout/canvas/createContext";
import Visualizer from "../js_game/visualizer";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";

class Board
{
    grid: Tile[][]
    size: Point
    sleighPos: Point // @TODO: set and use

    constructor(size:Point) 
    {
        this.size = size;
        this.createGrid();
    }

    createGrid()
    {
        this.grid = [];
        for(let x = 0; x < this.size.x; x++)
        {
            this.grid[x] = [];
            for(let y = 0; y < this.size.y; y++)
            {
                this.grid[x][y] = null;
            }
        }
    }

    // @TODO: create default function for "get random position within rectangle"?
    placeSleigh(tile:Tile, maxDistCenter:number)
    {
        const cX = 0.5 * this.size.x;
        const cY = 0.5 * this.size.y;
        const posX = range(cX - maxDistCenter*cX, cX + maxDistCenter*cX);
        const posY = range(cY - maxDistCenter*cY, cY + maxDistCenter*cY);
        const pos = new Point(posX, posY).round();

        this.placeTile(pos, tile);
        this.sleighPos = pos;
    }

    placeTile(pos:Point, tile:Tile)
    {
        this.grid[pos.x][pos.y] = tile;
    }

    removeTile(pos:Point, tile:Tile)
    {
        const currentContent = this.getCell(pos);
        if(tile && currentContent != tile) { console.error("Can't remove tile from position, it's not there.", pos, tile); return; }
        this.grid[pos.x][pos.y] = null;
    }

    moveSleigh(target:Point)
    {
        const sleighTile = this.getCell(this.sleighPos);
        const from = this.sleighPos.clone();
        this.removeTile(this.sleighPos, sleighTile);

        const dir = this.sleighPos.vecTo(target).normalize();
        const tilePositions = this.getPositionsInDir(this.sleighPos, dir, target);
        const tiles = [];
        for(const tilePos of tilePositions)
        {
            const t = this.getCell(tilePos);
            tiles.push(t);
            this.removeTile(tilePos, t);
        }

        this.sleighPos = target;
        this.placeTile(target, sleighTile);

        console.log(tiles);

        return { from, tilePositions, tiles };
    }

    undoSleigh(from:Point, tilePositions:Point[], tiles:Tile[])
    {
        // remove sleigh from current position
        // add sleigh back where it was (should be an empty cell, nothing overridden)
        const sleighTile = this.getCell(this.sleighPos);
        this.removeTile(this.sleighPos, sleighTile);

        this.sleighPos = from;
        this.placeTile(from, sleighTile);

        // add all tiles back where they were
        for(let i = 0; i < tilePositions.length; i++)
        {
            this.placeTile(tilePositions[i], tiles[i]);
        }
    }

    // the board is not split; each tile can visit any other tile with a path over the board
    isFullyConnected()
    {
        const tilesVisited : Tile[] = [];
        const posToVisit : Point[] = [this.sleighPos];
        while(posToVisit.length > 0)
        {
            const curPos = posToVisit.pop();
            const tile = this.getCell(curPos);
            tilesVisited.push(tile);

            const nbs = this.getNeighbors(curPos);
            for(const nb of nbs)
            {
                const tileHere = this.getCell(nb);
                if(!tileHere) { continue; }

                const alreadyVisited = tilesVisited.includes(tileHere);
                if(alreadyVisited) { continue; }
                
                posToVisit.push(nb);
            }
        }

        return tilesVisited.length >= this.countTiles();
    }

    getValidSleighMoves() : Point[]
    {
        // find cells that are on the same LINE (row/col match)
        // and either USED or ADJACENT
        const emptyAdjacentCells = this.getEmptyAdjacentCells(); 
        const cellsInStraightLine = [];
        for(let x = 0; x < this.size.x; x++) 
        {
            const pos = new Point(x, this.sleighPos.y);
            if(pos.matches(this.sleighPos)) { continue; }

            const isAdjacent = emptyAdjacentCells.filter((val) => { return val.matches(pos)}).length > 0;
            if(!this.getCell(pos) && !isAdjacent) { continue; }
            cellsInStraightLine.push(pos);
        }

        for(let y = 0; y < this.size.y; y++)
        {
            const pos = new Point(this.sleighPos.x, y);
            if(pos.matches(this.sleighPos)) { continue; }

            const isAdjacent = emptyAdjacentCells.filter((val) => { return val.matches(pos)}).length > 0;
            if(!this.getCell(pos) && !isAdjacent) { continue; }
            cellsInStraightLine.push(pos);
        }

        // now perform each move and check if the board is split
        // (this is quite expensive, but necessary)
        const validMoves = [];
        for(const cell of cellsInStraightLine)
        {
            const { from, tilePositions, tiles } = this.moveSleigh(cell);
            const boardIsConnected = this.isFullyConnected();
            this.undoSleigh(from, tilePositions, tiles);
            if(!boardIsConnected) { continue; }
            validMoves.push(cell);
        }

        return validMoves;
    }

    getValidPlacements(tile:Tile) : Point[]
    {
        const emptyAdjacentCells = this.getEmptyAdjacentCells();
        const validCells = [];
        for(const option of emptyAdjacentCells)
        {
            this.placeTile(option, tile);
            const { row, col } = this.getRowAndColumnAround(option);
            this.removeTile(option, tile);

            if(!this.inNumericOrder(row)) { continue; }
            if(!this.inNumericOrder(col)) { continue; }
            validCells.push(option);
        }
        return validCells;
    }

    getRowAndColumnAround(pos:Point)
    {
        const tile = this.getCell(pos);
        const left = this.getTilesInDir(pos, Point.LEFT);
        const right = this.getTilesInDir(pos, Point.RIGHT);
        const row = [left.reverse(), tile, right].flat();

        const up = this.getTilesInDir(pos, Point.UP);
        const down = this.getTilesInDir(pos, Point.DOWN);
        const col = [up.reverse(), tile, down].flat();

        return { row, col };
    }

    // @NOTE: Does NOT include the starting pos itself
    // @NOTE: DOES include the cutoff pos itself
    getPositionsInDir(pos:Point, dir:Point, cutoff:Point = null)
    {
        let tempPos = pos.clone();
        const arr = [];
        while(true)
        {
            if(cutoff && tempPos.matches(cutoff)) { break; }
            tempPos.move(dir);
            const cell = this.getCell(tempPos);
            if(!cell) { break; }
            arr.push(tempPos.clone());
        }
        return arr;
    }

    getTilesInDir(pos:Point, dir:Point, cutoff:Point = null)
    {
        const positions = this.getPositionsInDir(pos, dir, cutoff);
        const arr = [];
        for(const position of positions)
        {
            arr.push(this.getCell(position));
        }
        return arr;
    }

    // the numbers are in order if the SIGN of the difference (to the previous number) is always the same
    inNumericOrder(list:Tile[])
    {
        if(list.length <= 2) { return true; }

        const numbersWithoutWildcards = list.filter((val) => { return !val.isWildcardNumber() });
        if(numbersWithoutWildcards.length <= 2) { return true; }

        const dir = numbersWithoutWildcards[1].getFirstNumber() - numbersWithoutWildcards[0].getFirstNumber();
        for(let i = 1; i < numbersWithoutWildcards.length; i++)
        {
            const diffToPrev = numbersWithoutWildcards[i].getFirstNumber() - numbersWithoutWildcards[i-1].getFirstNumber();
            if(Math.sign(dir) != Math.sign(diffToPrev)) { return false; }
        }
        return true;
    }

    getEmptyAdjacentCells()
    {
        const arr = [];
        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                const pos = new Point(x,y);
                const notEmpty = this.getCell(pos);
                if(notEmpty) { continue; }

                const nbs = this.getNeighbors(pos);
                let hasNeighborTile = false;
                for(const nb of nbs)
                {
                    if(this.getCell(nb)) { hasNeighborTile = true; break; }
                }

                if(!hasNeighborTile) { continue; }
                arr.push(pos);
            }
        }
        return arr;
    }

    getNeighbors(pos:Point) : Point[]
    {
        const dirs = [Point.UP, Point.RIGHT, Point.DOWN, Point.LEFT]
        const arr = [];
        for(const dir of dirs)
        {
            const nbPos = pos.clone().move(dir);
            if(this.outOfBounds(nbPos)) { continue; }
            arr.push(nbPos);
        }
        return arr;
    }

    outOfBounds(pos:Point)
    {
        return pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y;
    }

    stringifyPosition(pos:Point)
    {
        return "<strong>(" + (pos.x + 1) + "," + (pos.y + 1) + ")</strong>";
    }

    getCells() { return this.grid.flat(); }
    getCellsUsed()
    {
        return this.getCells().filter((val) => { return val != null; });
    }

    getCell(pos:Point)
    {
        if(this.outOfBounds(pos)) { return null; }
        return this.grid[pos.x][pos.y];
    }

    countTiles() 
    { 
        return this.getCellsUsed().length;
    }

    getShortestDim()
    {
        return Math.min(this.size.x, this.size.y);
    }

    checkWishesFulfilled(tiles:Tile[])
    {
        // last tile = house
        const wishes = tiles[tiles.length - 1].reqs;
        const types = [];

        // so also ignore the last tile here, we can't deliver a house to itself!
        for(let i = 0; i < tiles.length - 1; i++) 
        { 
            types.push(tiles[i].getFirstType()); 
        }

        // first check all direct hits
        for(let i = wishes.length - 1; i >= 0; i--)
        {
            const wish = wishes[i];
            if(wish == "wildcard") { continue; }
            const idx = types.indexOf(wish);
            if(idx == -1) { continue; }
            wishes.splice(i, 1);
            types.splice(idx, 1);
        }

        // then check all wildcard REQUIREMENTS/WISHES (that can be fulfilled with any type picked up)
        for(let i = wishes.length - 1; i >= 0; i--)
        {
            const wish = wishes[i];
            if(wish != "wildcard") { continue; }

            for(let a = 0; a < types.length; a++)
            {
                if(types[a] == "wildcard") { continue; }
                types.splice(a, 1);
                break;
            }
            wishes.splice(i, 1);
        }

        // finally, wildcard TYPES can match anything willy-nilly (if anything's left)
        if(wishes.length > 0)
        {
            for(const type of types)
            {
                if(type != "wildcard") { continue; }
                wishes.pop();
            }
        }

        const allWishesFulfilled = wishes.length <= 0;
        return allWishesFulfilled;
    }

    async draw(highlightedTiles:Point[] = []) : Promise<HTMLImageElement>
    {
        const tileSize = CONFIG.rulebook.tileSize;
        const fullSize = this.size.clone().scale(tileSize);
        const ctx = createContext({ size: fullSize });

        let filledCellsAreHighlighted = false;
        for(const pos of highlightedTiles)
        {
            if(this.getCell(pos)) { filledCellsAreHighlighted = true; break; }
        }

        for(let x = 0; x < this.size.x; x++)
        {
            for(let y = 0; y < this.size.y; y++)
            {
                const pos = new Point(x,y);
                const isHighlighted = highlightedTiles.filter((val) => { return val.matches(pos); }).length > 0;
                const color = isHighlighted ? CONFIG.rulebook.highlightColor : "#FFFFFF";
                ctx.fillStyle = color;
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

                const tileHere = this.getCell(pos);
                if(tileHere)
                {
                    ctx.globalAlpha = filledCellsAreHighlighted ? (isHighlighted ? 1.0 : 0.45) : 1.0;
                    const subCanv = await tileHere.drawForRules(visualizer);
                    ctx.drawImage(subCanv, x * tileSize, y * tileSize);
                    ctx.globalAlpha = 1.0;
                }
                
                const strokeColor = isHighlighted ? CONFIG.rulebook.highlightStrokeColor : "#000000";
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = CONFIG.rulebook.lineWidth * tileSize;
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

            }
        }

        const img = await convertCanvasToImage(ctx.canvas);
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        return img;
    }
}


async function generate()
{
    await resLoader.loadPlannedResources();

    const tiles = shuffle(picker.get().slice());

    // extract sleigh tile, remove them all from options for random draw
    let sleighTile = null;
    for(let i = tiles.length - 1; i >= 0; i--)
    {
        if(tiles[i].getFirstType() != "sleigh") { continue; }
        sleighTile = tiles[i];
        tiles.splice(i, 1);
    }

    const tileToPlace = tiles.pop();

    // fill the board with something believable
    const board = new Board(CONFIG.rulebook.boardDims);
    board.placeSleigh(sleighTile, CONFIG.rulebook.sleighMaxDistFromCenter);

    let boardTooEmpty = true;
    while(boardTooEmpty)
    {
        const tile = tiles.pop();

        const validPlacements = board.getValidPlacements(tile);
        if(validPlacements.length <= 0) { continue; }
        
        const randPos = fromArray(validPlacements);
        board.placeTile(randPos, tile);

        boardTooEmpty = board.countTiles() < CONFIG.rulebook.minNumBoardTiles;
    }

    // check what we can do with our tile
    const validPlacements = board.getValidPlacements(tileToPlace);
    const validSleighMoves = board.getValidSleighMoves();
    const moveSleigh = (validPlacements.length <= 0 || Math.random() <= CONFIG.rulebook.moveSleighProb) && validSleighMoves.length > 0;

    if(moveSleigh) {
        o.addParagraph("You want to <strong>move the sleigh</strong>. Below are all valid locations. (Remember you can't split the board.)");
        o.addNode(await board.draw(validSleighMoves));

        const houseMoves = [];
        for(const move of validSleighMoves)
        {
            const data = board.getCell(move);
            if(!data) { continue; }
            if(data.getFirstType() != "house") { continue; }
            houseMoves.push(move);
        }

        const shouldMoveToHouse = houseMoves.length > 0;
        if(shouldMoveToHouse) {
            const move = fromArray(houseMoves);
            o.addParagraph("You decide to move to the house at " + board.stringifyPosition(move) + ". The final board looks like this:");

            const { from, tilePositions, tiles } = board.moveSleigh(move);
            const allWishesFulfilled = board.checkWishesFulfilled(tiles);

            o.addNode(await board.draw());

            if(allWishesFulfilled) {
                o.addParagraph("You collected all the right presents along the way! <strong>Score the house.</strong> Next turn!");
            } else {
                o.addParagraph("Unfortunately, you didn't collect the right wishes along the way. The house is removed <strong>without scoring it</strong>. Next turn!")
            }

        } else {
            const move = fromArray(validSleighMoves);
            o.addParagraph("You decide to move to " + board.stringifyPosition(move) + ". The final board looks like this:");
            board.moveSleigh(move);
            o.addNode(await board.draw());     
        }
    } else {
        let str = tileToPlace.isWildcardNumber() ? "with <strong>a wildcard number</strong>" :  "with number <strong>" + tileToPlace.getFirstNumber() + "</strong>";

        o.addParagraph("You want to <strong>place</strong> a tile " + str + ". Below are all valid locations.");
        o.addNode(await board.draw(validPlacements));

        if(validPlacements.length <= 0) {
            o.addParagraph("You can't place anywhere, nor can you move the sleigh. So you can't do anything: draw a tile and skip your turn.");
        } else {
            o.addParagraph("You pick one of them, then draw a new tile. Next turn!");
        }
    }
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
resLoader.planLoadMultiple(CONFIG.assets);

const visualizer = new Visualizer(resLoader, new Point(CONFIG.rulebook.tileSize), false);

const picker = new TilePicker();
picker.generate();