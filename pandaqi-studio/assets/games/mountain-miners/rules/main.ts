import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import createContext from "js/pq_games/layout/canvas/createContext";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample";
import Tile from "../game/tile";
import TilePicker from "../game/tilePicker";
import CONFIG from "../shared/config";
import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import { TILES, TileData } from "../shared/dict";

class Board
{
    grid: Tile[][]
    size: Point
    arrowIndex: number // quarter rots; e.g. 1 = 0.5 PI = at right corner
    randBoardRotation: number; // same

    constructor(size:Point) 
    {
        this.size = size;
        this.randBoardRotation = rangeInteger(0,3);
    }

    fillRandom(options:Tile[])
    {
        const center = this.size.clone().scale(0.5).floor();
        const maxDistFromCenter = (center.x + center.y)*2;

        this.grid = [];
        for(let x = 0; x < this.size.x; x++)
        {
            this.grid[x] = [];
            for(let y = 0; y < this.size.y; y++)
            {
                const distFromCenter = Math.abs(y - center.y) + Math.abs(x - center.x);
                const shouldFill = Math.random() <= 1.0 - distFromCenter/maxDistFromCenter;

                let tile = null;
                if(shouldFill) { tile = options.pop(); tile.customData.pos = new Point(x,y); }
                this.grid[x][y] = tile;
                
            }
        }
    }

    placeArrow()
    {
        this.arrowIndex = rangeInteger(0,7) * 0.5;
    }

    rotateArrow()
    {
        this.arrowIndex = (this.arrowIndex + 1) % 4;
    }

    removeTile(tile:Tile)
    {
        const pos = tile.customData.pos;
        this.grid[pos.x][pos.y] = null;
    }

    getTopLayerTiles() : Tile[]
    {
        const flooredRotation = Math.floor(this.arrowIndex)
        const checkVector = Point.DOWN.clone();
        checkVector.rotate(flooredRotation * 0.5 * Math.PI).round();

        const rowVector = new Point(1,-1);
        rowVector.rotate(this.arrowIndex * 0.5 * Math.PI).round();

        const startCells = 
        [
            new Point(),
            new Point(this.size.x-1,0),
            new Point(this.size.x-1, this.size.y-1),
            new Point(0, this.size.y-1),
        ]

        let curCell : Point = startCells[flooredRotation];
        while(!this.outOfBounds(curCell))
        {
            const tiles = this.getTilesInRow(curCell, rowVector);
            if(tiles.length > 0) { return tiles; }
            curCell.add(checkVector);
        }
    }

    getTilesInRow(pos:Point, vec:Point) : Tile[]
    {
        let curPos = pos.clone();
        const tiles = [];
        while(!this.outOfBounds(curPos))
        {
            const tile = this.getCell(curPos);
            if(tile) { tiles.push(tile); }
            curPos.add(vec);
        }
        return tiles;
    }

    outOfBounds(pos:Point) : boolean
    {
        return pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y;
    }

    getCells() { return this.grid.flat(); }
    getCellsUsed()
    {
        return this.getCells().filter((val) => { return val != null; });
    }

    getCell(pos:Point)
    {
        return this.grid[pos.x][pos.y];
    }

    countTiles() 
    { 
        return this.getCellsUsed().length;
    }

    async draw(highlightedTiles:Tile[] = []) : Promise<HTMLImageElement>
    {
        const tileSize = CONFIG.rulebook.tileSize;
        const mapSize = this.size.clone().scale(tileSize);

        const rot = (this.arrowIndex + this.randBoardRotation) % 4;
        const extraYSpaceNeeded = (rot == 0 || rot == 2) ? 6 : 3;
        const extraXSpaceNeeded = (rot == 1 || rot == 3) ? 6 : 3;

        const fullSize = this.size.clone().add(new Point(extraXSpaceNeeded,extraYSpaceNeeded)).scale(tileSize); // add extra margin for arrow tile
        const ctx = createContext({ size: fullSize });
        const csize = new Point(this.size.x-1, this.size.y-1).scale(0.5);

        // prepare canvas so stuff is drawn in center and like a diamond shape
        ctx.translate(0.5*fullSize.x, 0.5 * fullSize.y);
        ctx.rotate(0.25*Math.PI + this.randBoardRotation * 0.5 * Math.PI);
        ctx.translate(-0.5*mapSize.x, -0.5*mapSize.y);

        // draw arrow at the correct corner
        const off = 0.5
        const ARROW_POSITIONS = 
        [
            new Point(-1,-1),
            new Point(csize.x, -1 - off),
            new Point(this.size.x,-1),
            new Point(this.size.x + off, csize.y),
            new Point(this.size.x, this.size.y),
            new Point(csize.x, this.size.y + off),
            new Point(-1, this.size.y),
            new Point(-1 - off, csize.y)
        ]

        const arrowTile = new Tile("arrow");
        const arrowPos = ARROW_POSITIONS[this.arrowIndex * 2];
        const isDiagonalArrow = this.arrowIndex != Math.floor(this.arrowIndex);

        ctx.save();
        ctx.translate(arrowPos.x * tileSize + 0.5 * tileSize, arrowPos.y * tileSize + 0.5 * tileSize);
        ctx.rotate(this.arrowIndex*0.5*Math.PI);
        ctx.translate(-0.5*tileSize, -0.5*tileSize);
        ctx.drawImage(await arrowTile.drawForRules(visualizer), 0, 0);
        ctx.restore();

        const someCellsAreHighlighted = highlightedTiles.length > 0;

        for(const cell of this.getCellsUsed())
        {
            const pos = cell.customData.pos;
            const isHighlighted = highlightedTiles.filter((val) => { return val == cell; }).length > 0;
            const color = isHighlighted ? CONFIG.rulebook.highlightColor : CONFIG.rulebook.nonHighlightColor;
            ctx.fillStyle = color;
            ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);

            const tile = this.getCell(pos);
            if(tile)
            {
                if(someCellsAreHighlighted && !isHighlighted) { ctx.globalAlpha = CONFIG.rulebook.nonHighlightAlpha; }
                const subCanv = await tile.drawForRules(visualizer);
                ctx.drawImage(subCanv, pos.x * tileSize, pos.y * tileSize);
                ctx.globalAlpha = 1.0;
            }
            
            const strokeColor = isHighlighted ? CONFIG.rulebook.highlightStrokeColor : CONFIG.rulebook.nonHighlightStrokeColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = CONFIG.rulebook.lineWidth * tileSize;
            ctx.strokeRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);
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

    const tiles = shuffle(picker.get());

    // fill the board with something believable
    const board = new Board(CONFIG.rulebook.boardDims);
    board.fillRandom(tiles);
    board.placeArrow();

    // show state + what you may grab 
    const topLayerTiles = board.getTopLayerTiles();
    o.addParagraph("At the start of your turn, the board looks like this. The highlighted tiles are the ones you're allowed to grab.");
    o.addNode(await board.draw(topLayerTiles));

    // execute that
    o.addParagraph("You grab one of the highlighted tiles. The arrow rotates one quarter step clockwise.");
    board.removeTile(shuffle(topLayerTiles)[0]);
    board.rotateArrow();

    // show end result
    o.addParagraph("At the end of your turn, the board looks like this,");
    o.addNode(await board.draw());
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
resLoader.planLoadMultiple(CONFIG.assets);

CONFIG.resLoader = resLoader;
CONFIG.itemSize = new Point(CONFIG.rulebook.tileSize);
const visualizer = new MaterialVisualizer(CONFIG);

const picker = new TilePicker();
picker.generate();
picker.removeArrows();


// 
// For auto-displaying all options in nice rules tables in rulebook
// 

const rtConversion = { heading: "label" };
const rtParams = { sheetURL: CONFIG.assets.tiles.path, base: CONFIG.assetsBase };

const parse = (dict:Record<string,TileData>, setFilter:string = "base") =>
{
    const output = {};
    for(const [key,data] of Object.entries(dict))
    {
        const setEntry = data.set ?? "base";
        if(setEntry != setFilter) { continue; }
        output[key] = data;

        if(!data.desc) { data.desc = "A gemstone that scores a fixed number of points." }
    }
    return output;
}

const nodeBase = convertDictToRulesTableHTML(parse(TILES, "base"), rtConversion, rtParams);
document.getElementById("rules-table-base").appendChild(nodeBase);

const nodeDarkTunnels = convertDictToRulesTableHTML(parse(TILES, "darkTunnels"), rtConversion, rtParams);
document.getElementById("rules-table-darkTunnels").appendChild(nodeDarkTunnels);

const nodeGemshards = convertDictToRulesTableHTML(parse(TILES, "gemShards"), rtConversion, rtParams);
document.getElementById("rules-table-gemShards").appendChild(nodeGemshards);

const nodeGoldenActions = convertDictToRulesTableHTML(parse(TILES, "goldenActions"), rtConversion, rtParams);
document.getElementById("rules-table-goldenActions").appendChild(nodeGoldenActions);

// @ts-ignore
if(window.PQ_RULEBOOK) { window.PQ_RULEBOOK.refreshRulesTables(); }