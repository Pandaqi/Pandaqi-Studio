import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import numberRange from "js/pq_games/tools/collections/numberRange";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";

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
    playerToken?: any,
    validPlacementCallback?: Function
}

const TILE_SIZE = 128;
const PLAYER_TOKEN_SIZE = 48;
const DEF_PLACEMENT_CALLBACK = (cell, grid, tiles) => 
{ 
    for(const tile of tiles)
    {
        // @NOTE: all Naivigation tiles must have this function?
        if(tile.isCollectible() == cell.collectible) { return tile; }
    }
    return null;
}

export { TileData, NaivigationSetupParams }
export default class RandomNaivigationSetupGenerator
{
    size: Point
    tiles: any[] // The specific game is responsible for handing a list of valid Tile/Token objects for that game
    playerToken: any
    validPlacementCallback: Function // As well as any special code regarding placement to be followed

    constructor(params:NaivigationSetupParams = {})
    {
        this.size = params.size ?? new Point(5,5);
        this.tiles = params.tiles ?? [];
        this.playerToken = params.playerToken ?? null;
        this.validPlacementCallback = params.validPlacementCallback ?? DEF_PLACEMENT_CALLBACK
    }

    async generate() : Promise<HTMLImageElement>
    {
        const ctx = createContext({ size: this.size.clone().scale(TILE_SIZE) })

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
            }
        }

        // place the player token
        const positions = this.getStartingPositions(cells);
        const startingCell = positions[rangeInteger(0,4)].cell; // pick one at random that's furthest away from all collectibles
        const startingRotation = rangeInteger(0,3);
        
        // draw it all
        const group = new ResourceGroup();
        for(const cell of cells)
        {
            const realPos = cell.position.clone().scale(TILE_SIZE).move(new Point(0.5*TILE_SIZE));

            // @TODO: we really need to support raw Canvases as well, or perhaps create a ResourceCanvas if that's too hard
            const resCell = new ResourceImage(await convertCanvasToImage(cell.tile.draw()));
            const cellOp = new LayoutOperation({
                translate: realPos,
                dims: new Point(TILE_SIZE),
                rotation: cell.rotation,
                pivot: Point.CENTER
            })
            group.add(resCell, cellOp);
            
            if(cell == startingCell)
            {
                const resToken = new ResourceImage(await convertCanvasToImage(this.playerToken.draw()));
                const tokenOp = new LayoutOperation({
                    translate: realPos,
                    dims: new Point(PLAYER_TOKEN_SIZE),
                    rotation: startingRotation,
                    pivot: Point.CENTER
                });
                group.add(resToken, tokenOp);
            }
        }

        group.toCanvas(ctx);
        return await convertCanvasToImage(ctx.canvas);
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