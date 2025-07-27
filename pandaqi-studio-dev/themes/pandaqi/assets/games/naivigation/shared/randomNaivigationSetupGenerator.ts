import convertCanvasToImage from "lib/pq-games/layout/canvas/convertCanvasToImage";
import createContext from "lib/pq-games/layout/canvas/createContext";
import LayoutOperation from "lib/pq-games/layout/layoutOperation";
import ResourceGroup from "lib/pq-games/layout/resources/resourceGroup";
import ResourceImage from "lib/pq-games/layout/resources/resourceImage";
import numberRange from "lib/pq-games/tools/collections/numberRange";
import MaterialVisualizer from "lib/pq-games/tools/generation/materialVisualizer";
import Point from "lib/pq-games/tools/geometry/point";
import rangeInteger from "lib/pq-games/tools/random/rangeInteger";
import shuffle from "lib/pq-games/tools/random/shuffle";
import InteractiveExample from "lib/pq-rulebook/examples/interactiveExample";
import { TileType } from "./dictShared";
import fromArray from "lib/pq-games/tools/random/fromArray";
import MaterialNaivigation from "./materialNaivigation";
import TilePickerNaivigation from "./generalPickerNaivigation";
import fillCanvas from "lib/pq-games/layout/canvas/fillCanvas";

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
    numVehicles?: number,
    tilePicker?: TilePickerNaivigation,
    validPlacementCallback?: TilePlacementFunction,
    vehicleStartCallback?: VehicleStartCallback,
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
const DEF_START_CALLBACK = (veh,set) => undefined;

type TilePlacementFunction = (cell:TileData, setup:RandomNaivigationSetupGenerator) => TileData
type VehicleStartCallback = (vehicle:MaterialNaivigation, setup:RandomNaivigationSetupGenerator) => TileData

export { TileData, NaivigationSetupParams }
export default class RandomNaivigationSetupGenerator
{
    grid: TileData[][];
    cells: TileData[]

    size: Point
    tilePicker: TilePickerNaivigation
    tiles: MaterialNaivigation[] // The specific game is responsible for handing a list of valid Tile/Token objects for that game
    tilesAll: MaterialNaivigation[]
    numVehicles: number
    
    vehicleTokens: MaterialNaivigation[]
    vehicleTokensAll: MaterialNaivigation[]
    vehicleTokenData: TileData[]

    validPlacementCallback: TilePlacementFunction // As well as any special code regarding placement to be followed
    vehicleStartCallback: VehicleStartCallback
    example: InteractiveExample
    visualizer: MaterialVisualizer

    ruleNoDiagonals = true // if on, diagonals snap to a random vertical/horizontal step instead

    constructor(params:NaivigationSetupParams = {})
    {
        this.size = params.size ?? new Point(5,5);
        this.numVehicles = params.numVehicles ?? 1;
        this.visualizer = params.visualizer;
        this.tilePicker = params.tilePicker;
        this.tiles = [];
        this.tilesAll = [];
        this.vehicleTokens = [];
        this.vehicleTokensAll = [];
        this.vehicleStartCallback = params.vehicleStartCallback ?? DEF_START_CALLBACK;
        this.validPlacementCallback = params.validPlacementCallback ?? DEF_PLACEMENT_CALLBACK;
        this.attachToRules();
    }

    generateAndSanitizeTiles()
    {
        if(this.tilesAll.length > 0 && this.vehicleTokensAll.length > 0) { return; }

        const allTiles = this.tilePicker.generate();
        const mapTiles = [];
        const playerTokens = [];
        const vehiclesAlreadyPicked = [];
        for(const tile of allTiles)
        {
            if(![TileType.VEHICLE, TileType.MAP].includes(tile.type as TileType)) { continue; }
            if(tile.isStartingTile()) { continue; }
            if(tile.type == TileType.VEHICLE && !vehiclesAlreadyPicked.includes(tile.key)) { playerTokens.push(tile); vehiclesAlreadyPicked.push(tile.key); }
            if(tile.type == TileType.MAP) { mapTiles.push(tile); }
        }

        this.tilesAll = mapTiles;
        this.vehicleTokensAll = playerTokens.slice(0, this.numVehicles);
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

    getCellRandom()
    {
        return fromArray(this.cells);
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
        this.grid = grid;
        this.cells = cells;

        console.log(cells);

        let invalidBoard = true;
        while(invalidBoard)
        {
            this.tiles = this.tilesAll.slice();

            // reset it all
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

        // place the player token(s)
        this.vehicleTokenData = [];

        const positions = this.getStartingPositions(cells); // this just sorts them based on distance to collectibles, which is fine for ALMOST ALL games
        this.vehicleTokens = this.vehicleTokensAll.slice();
        for(const vehicle of this.vehicleTokens)
        {
            const startingCell = this.vehicleStartCallback(vehicle, this) ?? positions.shift();
            const startingRotation = rangeInteger(0,3);
    
            const dataObj = { 
                tile: startingCell.tile,
                position: startingCell.position,
                rot: startingRotation,
                collectible: false,
                facedown: false
            }
            this.vehicleTokenData.push(dataObj);
        }
    }

    async visualize() : Promise<HTMLImageElement>
    {
        await this.visualizer.resLoader.loadPlannedResources();

        console.log(this.vehicleTokenData);

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

            for(let i = 0; i < this.vehicleTokenData.length; i++)
            {
                const data = this.vehicleTokenData[i];
                const vehicleIsHere = cell.position.matches(data.position);
                if(!vehicleIsHere) { continue; }

                const canvToken = await this.drawItem(this.vehicleTokens[i]);
                const resToken = new ResourceImage(canvToken);
                const tokenOp = new LayoutOperation({
                    pos: realPos,
                    size: new Point(PLAYER_TOKEN_SIZE),
                    rot: data.rot * 0.5 * Math.PI,
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

        return positions.map((x) => x.cell);
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

    getVehicle(idx = 0) { return this.vehicleTokens[idx]; }
    getVehicleData(idx = 0) { return this.vehicleTokenData[idx]; }

    rotatePlayer(idx = 0, rot = 0)
    {
        this.getVehicleData(idx).rot = (this.getVehicleData(idx).rot + rot + 4) % 4;
    }

    movePlayer(idx = 0, vector = Point.RIGHT, levelWrap = false)
    {
        const curPosition = this.getVehicleData(idx).position;
        let newPosition = curPosition.clone().add(vector);
        if(levelWrap) { newPosition = this.wrapPosition(newPosition); }
        this.setPlayerPosition(idx, newPosition);
    }

    setPlayerPosition(idx = 0, pos:Point)
    {
        this.getVehicleData(idx).position = pos;
        if(!this.isOutOfBounds(pos))
        {
            this.getVehicleData(idx).tile = this.grid[pos.x][pos.y].tile;
        }
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
        if(Math.abs(vector.x) < 0.03) { vector.x = 0; }
        if(Math.abs(vector.y) < 0.03) { vector.y = 0; }

        vector.x = Math.sign(vector.x);
        vector.y = Math.sign(vector.y);

        const isDiagonal = Math.abs(vector.x) > 0 && Math.abs(vector.y) > 0;
        if(this.ruleNoDiagonals && isDiagonal)
        {
            if(Math.random() <= 0.5) { vector.x = 0; } else { vector.y = 0; }
        }

        return vector;
    }

    movePlayerForward(idx = 0, numSteps = 1, levelWrap = false)
    {
        const forwardVec = this.getVectorFromRotation(this.getVehicleData(idx).rot).scale(numSteps);
        this.movePlayer(idx, forwardVec, levelWrap);
    }

    movePlayerBackward(idx = 0, numSteps = 1, levelWrap = false)
    {
        const backwardVec = this.getVectorFromRotation(this.getVehicleData(idx).rot).scale(numSteps).negate();
        this.movePlayer(idx, backwardVec, levelWrap);
    }

    collectCurrentTile(idx = 0)
    {
        this.getCellAt(this.getVehicleData(idx).position).facedown = true
    }

    isOutOfBounds(pos:Point) : boolean
    {
        return pos.x < 0 || pos.x >= this.grid.length || pos.y < 0 || pos.y >= this.grid[0].length;
    }

    isPlayerOutOfBounds(idx = 0) : boolean
    {
        return this.isOutOfBounds(this.getVehicleData(idx).position);
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