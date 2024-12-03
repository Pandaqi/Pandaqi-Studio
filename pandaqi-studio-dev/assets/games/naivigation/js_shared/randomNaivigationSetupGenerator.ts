import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import numberRange from "js/pq_games/tools/collections/numberRange";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample";
import { TileType } from "./dictShared";
import fromArray from "js/pq_games/tools/random/fromArray";
import MaterialNaivigation from "./materialNaivigation";
import TilePickerNaivigation from "./generalPickerNaivigation";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";

interface TileData
{
    tile: MaterialNaivigation
    position?: Point,
    rot?: number,
    collectible?: boolean,
    facedown?: boolean
}

interface NaivigationSetupParams
{
    size?: Point,
    tilePicker?: TilePickerNaivigation,
    validPlacementCallback?: TilePlacementFunction,
    visualizer?: MaterialVisualizer
}

const TILE_SIZE = 128;
const PLAYER_TOKEN_SIZE = 128; // it's drawn smaller anyway by default
const DEF_PLACEMENT_CALLBACK = (cell, setup) => 
{ 
    let tileFinal = null;
    for(const tile of setup.tiles)
    {
        if(tile.isCollectible() == cell.collectible) { tileFinal = tile; break; }
    }
    return { tile: tileFinal }
}

type TilePlacementFunction = (cell:TileData, setup:RandomNaivigationSetupGenerator) => TileData

export { TileData, NaivigationSetupParams }
export default class RandomNaivigationSetupGenerator
{
    grid: TileData[][];
    cells: TileData[]

    size: Point
    tilePicker: TilePickerNaivigation
    tiles: MaterialNaivigation[] // The specific game is responsible for handing a list of valid Tile/Token objects for that game
    playerToken: MaterialNaivigation
    playerTokenData: TileData
    validPlacementCallback: TilePlacementFunction // As well as any special code regarding placement to be followed
    example: InteractiveExample
    visualizer: MaterialVisualizer

    ruleNoDiagonals = true // if on, diagonals snap to a random vertical/horizontal step instead

    constructor(params:NaivigationSetupParams = {})
    {
        this.size = params.size ?? new Point(5,5);
        this.visualizer = params.visualizer;
        this.tilePicker = params.tilePicker;
        this.tiles = [];
        this.validPlacementCallback = params.validPlacementCallback ?? DEF_PLACEMENT_CALLBACK;
        this.attachToRules();
    }

    generateAndSanitizeTiles()
    {
        if(this.tiles.length > 0 && this.playerToken) { return; }

        const allTiles = this.tilePicker.generate();
        const mapTiles = [];
        const playerTokens = [];
        for(const tile of allTiles)
        {
            if(tile.isStartingTile()) { continue; }
            if(tile.type == TileType.VEHICLE) { playerTokens.push(tile); }
            else if(tile.type == TileType.MAP) { mapTiles.push(tile); }
        }

        this.tiles = mapTiles;
        this.playerToken = fromArray(playerTokens);
    }

    attachToRules()
    {
        const e = new InteractiveExample({ id: "naivigation-setup" });
        e.setButtonText("Give me a random setup!");
        e.setGenerationCallback(this.onSetupRequested.bind(this));
        this.example = e;
    }

    getCellAt(pos:Point)
    {
        return this.grid[pos.x][pos.y];
    }

    generate()
    {
        this.generateAndSanitizeTiles();

        // initialize the original tiles
        // BASE RULE => In every row, place ONE collectible at a unique column
        let grid : TileData[][] = [];
        const allRows = shuffle(numberRange(0, this.size.y - 1));

        for(let x = 0; x < this.size.x; x++)
        {
            const collectibleIndex = allRows[x];

            grid[x] = [];
            for(let y = 0; y < this.size.y; y++)
            {
                grid[x][y] = {
                    tile: null,
                    position: new Point(x,y),
                    rot: 0,
                    collectible: (y == collectibleIndex),
                    facedown: false
                }
            }
        }

        // Keep trying until we have a layout that is valid
        const cells = grid.flat();
        let invalidBoard = true;
        const tilesCopy = this.tiles.slice();
        while(invalidBoard)
        {
            // reset it all
            this.tiles = tilesCopy;
            invalidBoard = false;
            for(const cell of cells)
            {
                cell.tile = null;
            }

            // draw new tiles
            shuffle(this.tiles);
            for(const cell of cells)
            {
                const tileData = this.validPlacementCallback(cell, this);
                if(!tileData) { invalidBoard = true; break; }
                cell.tile = tileData.tile;
                cell.rot = tileData.rot ?? rangeInteger(0,3);
                this.tiles.splice(this.tiles.indexOf(tileData.tile), 1);
            }
        }

        // place the player token
        const positions = this.getStartingPositions(cells);
        const finalPick = positions[rangeInteger(0,1)];
        const startingCell : TileData = finalPick.cell; // pick one at random that's furthest away from all collectibles
        const startingRotation = rangeInteger(0,3);

        this.playerTokenData = { 
            tile: startingCell.tile,
            position: startingCell.position,
            rot: startingRotation,
            collectible: false,
            facedown: false
        }

        this.grid = grid;
        this.cells = cells;
    }

    async visualize() : Promise<HTMLImageElement>
    {
        await this.visualizer.resLoader.loadPlannedResources();

        // draw it all
        const ctx = createContext({ size: this.size.clone().scale(TILE_SIZE) })
        const tileMargin = 0.0375*TILE_SIZE
        const group = new ResourceGroup();
        for(const cell of this.cells)
        {
            const realPos = cell.position.clone().scale(TILE_SIZE).move(new Point(0.5*TILE_SIZE));

            const canv = await this.drawItem(cell.tile, cell.facedown);
            const resCell = new ResourceImage(canv);
            const cellOp = new LayoutOperation({
                pos: realPos,
                size: new Point(TILE_SIZE).sub(new Point(2*tileMargin)),
                rot: cell.rot * 0.5 * Math.PI,
                pivot: Point.CENTER
            })
            group.add(resCell, cellOp);
            
            if(cell.position.matches(this.playerTokenData.position))
            {
                const canvToken = await this.drawItem(this.playerToken);
                const resToken = new ResourceImage(canvToken);
                const tokenOp = new LayoutOperation({
                    pos: realPos,
                    size: new Point(PLAYER_TOKEN_SIZE),
                    rot: this.playerTokenData.rot * 0.5 * Math.PI,
                    pivot: Point.CENTER
                });
                group.add(resToken, tokenOp);
            }
        }

        group.toCanvas(ctx);
        return await convertCanvasToImage(ctx.canvas);
    }

    async onSetupRequested(customOutput = null)
    {
        this.generate();
        const o = customOutput ?? this.example.getOutputBuilder();
        await this.visualizeToOutput(o)
    }

    async visualizeToOutput(outputBuilder)
    {
        const img = await this.visualize();
        outputBuilder.addNode(img);
        // @NOTE: modifying image style comes AFTER adding node, because `addNode` can (re)set styles too
        img.style.maxHeight = "100%";
        img.style.display = "block";
        img.style.margin = "auto";
    }

    getDistToClosestCollectible(cell:TileData, cells:TileData[])
    {
        let minDist = Infinity;
        for(const otherCell of cells)
        {
            if(!otherCell.collectible) { continue; }
            const dist = Math.abs(cell.position.x -  otherCell.position.x) + Math.abs(cell.position.y - otherCell.position.y);
            minDist = Math.min(minDist, dist);
        }
        return minDist;
    }

    getStartingPositions(cells:TileData[])
    {
        const positions = [];
        for(const cell of cells)
        {
            const dist = this.getDistToClosestCollectible(cell, cells);
            positions.push({ cell: cell, dist: dist });
        }

        positions.sort((a,b) => {
            return b.dist - a.dist
        })

        return positions;
    }

    async drawItem(item:MaterialNaivigation, facedown = false)
    {
        if(facedown)
        {
            const ctx = createContext({ size: this.visualizer.size });
            fillCanvas(ctx, "#FFFFFF");
            return await convertCanvasToImage(ctx.canvas);
        }

        return item.drawForRules(this.visualizer);
    }

    rotatePlayer(rot = 0)
    {
        this.playerTokenData.rot = (this.playerTokenData.rot + rot + 4) % 4;
    }

    movePlayer(vector:Point, levelWrap = false)
    {
        const curPosition = this.playerTokenData.position;
        let newPosition = curPosition.clone().add(vector);
        if(levelWrap) { newPosition = this.wrapPosition(newPosition); }
        this.setPlayerPosition(newPosition);
    }

    setPlayerPosition(pos:Point)
    {
        this.playerTokenData.position = pos;
        this.playerTokenData.tile = this.grid[pos.x][pos.y].tile;
    }

    wrapPosition(pos:Point) : Point
    {
        const posOut = new Point();
        posOut.x = (pos.x + this.size.x) % this.size.x;
        posOut.y = (pos.y + this.size.y) % this.size.y;
        return posOut;
    }
    
    getVectorFromRotation(rot = 0) : Point
    {
        const rotReal = rot * 0.5 * Math.PI;
        const vector = new Point(Math.cos(rotReal), Math.sin(rotReal));
        vector.x = Math.sign(vector.x);
        vector.y = Math.sign(vector.y);

        const isDiagonal = Math.abs(vector.x) > 0 && Math.abs(vector.y) > 0;
        if(this.ruleNoDiagonals && isDiagonal)
        {
            if(Math.random() <= 0.5) { vector.x = 0; } else { vector.y = 0; }
        }

        return vector;
    }

    movePlayerForward(numSteps = 1, levelWrap = false)
    {
        const forwardVec = this.getVectorFromRotation(this.playerTokenData.rot).scale(numSteps);
        this.movePlayer(forwardVec, levelWrap);
    }

    movePlayerBackward(numSteps = 1, levelWrap = false)
    {
        const backwardVec = this.getVectorFromRotation(this.playerTokenData.rot).scale(numSteps).negate();
        this.movePlayer(backwardVec, levelWrap);
    }

    // @TODO: these two conversion functions are not great, do something more robust?
    convertRotationToVector(rot:number)
    {
        return new Point().fromAngle(rot * 0.5 * Math.PI);
    }

    convertVectorToRotation(vec:Point)
    {
        if(vec.x == 1) { return 0; }
        if(vec.y == 1) { return 1; }
        if(vec.x == -1) { return 2; }
        return 3;
    }
}