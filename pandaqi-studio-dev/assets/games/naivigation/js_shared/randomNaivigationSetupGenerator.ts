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

interface TileData
{
    tile: any
    position: Point,
    rotation: number,
    collectible: boolean
}

interface NaivigationSetupParams
{
    size?: Point,
    tiles?: any[],
    validPlacementCallback?: Function,
    visualizer?: MaterialVisualizer
}

const TILE_SIZE = 128;
const PLAYER_TOKEN_SIZE = 48;
const DEF_PLACEMENT_CALLBACK = (cell, grid, tiles) => 
{ 
    let tileFinal = null;
    for(const tile of tiles)
    {
        if(tile.isCollectible() == cell.collectible) { tileFinal = tile; break; }
    }
    return { tile: tileFinal }
}

export { TileData, NaivigationSetupParams }
export default class RandomNaivigationSetupGenerator
{
    grid: TileData[][];
    cells: TileData[]

    size: Point
    tiles: any[] // The specific game is responsible for handing a list of valid Tile/Token objects for that game
    playerToken: any
    playerTokenData: TileData
    validPlacementCallback: Function // As well as any special code regarding placement to be followed
    example: InteractiveExample
    visualizer: MaterialVisualizer

    constructor(params:NaivigationSetupParams = {})
    {
        this.size = params.size ?? new Point(5,5);
        this.visualizer = params.visualizer;
        this.tiles = params.tiles ?? [];
        this.validPlacementCallback = params.validPlacementCallback ?? DEF_PLACEMENT_CALLBACK
        this.attachToRules();
        this.sanitizeTiles();
    }

    sanitizeTiles()
    {
        const mapTiles = [];
        const playerTokens = [];
        for(const tile of this.tiles)
        {
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

    generate()
    {
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
                    rotation: 0,
                    collectible: (y == collectibleIndex)
                }
            }
        }

        console.log(grid);

        // Keep trying until we have a layout that is valid
        const cells = grid.flat()
        let invalidBoard = true;
        while(invalidBoard)
        {
            // reset it all
            invalidBoard = false;
            for(const cell of cells)
            {
                cell.tile = null;
            }

            // draw new tiles
            const tiles = shuffle(this.tiles.slice());
            for(const cell of cells)
            {
                const tileData = this.validPlacementCallback(cell, grid, tiles);
                if(!tileData) { invalidBoard = true; break; }
                cell.tile = tileData.tile;
                cell.rotation = tileData.rotation ?? rangeInteger(0,3);
                tiles.splice(tiles.indexOf(tileData.tile), 1);
            }
        }

        console.log("HAAAA");

        // place the player token
        const positions = this.getStartingPositions(cells);
        const finalPick = positions[rangeInteger(0,4)];
        const startingCell = finalPick.cell; // pick one at random that's furthest away from all collectibles
        const startingRotation = rangeInteger(0,3);

        this.playerTokenData = { 
            tile: startingCell,
            position: finalPick.position,
            rotation: startingRotation,
            collectible: false
        }

        this.grid = grid;
        this.cells = cells;
    }

    async visualize() : Promise<HTMLImageElement>
    {
        await this.visualizer.resLoader.loadPlannedResources();

        // draw it all
        const ctx = createContext({ size: this.size.clone().scale(TILE_SIZE) })
        const group = new ResourceGroup();
        for(const cell of this.cells)
        {
            const realPos = cell.position.clone().scale(TILE_SIZE).move(new Point(0.5*TILE_SIZE));

            // @TODO: we really need to support raw Canvases as well, or perhaps create a ResourceCanvas if that's too hard
            const img = await convertCanvasToImage(await cell.tile.drawForRules(this.visualizer));
            const resCell = new ResourceImage(img);
            const cellOp = new LayoutOperation({
                translate: realPos,
                dims: new Point(TILE_SIZE),
                rotation: cell.rotation * 0.5 * Math.PI,
                pivot: Point.CENTER
            })
            group.add(resCell, cellOp);
            
            if(cell == this.playerTokenData.tile)
            {
                const imgToken = await convertCanvasToImage(await this.playerToken.drawForRules(this.visualizer));
                const resToken = new ResourceImage(imgToken);
                const tokenOp = new LayoutOperation({
                    translate: realPos,
                    dims: new Point(PLAYER_TOKEN_SIZE),
                    rotation: this.playerTokenData.rotation * 0.5 * Math.PI,
                    pivot: Point.CENTER
                });
                group.add(resToken, tokenOp);
            }
        }

        group.toCanvas(ctx);
        return await convertCanvasToImage(ctx.canvas);
    }

    async onSetupRequested()
    {
        this.generate();
        const img = await this.visualize();
        const o = this.example.getOutputBuilder();
        o.addNode(img);
    }

    getDistToClosestCollectible(cell, cells)
    {
        let minDist = Infinity;
        for(const otherCell of cells)
        {
            if(!otherCell.collectible) { return; }
            const dist = Math.abs(cell.position.x -  otherCell.position.x) + Math.abs(cell.position.y - otherCell.position.y);
            minDist = Math.min(minDist, dist);
        }
        return minDist;
    }

    getStartingPositions(cells)
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
}