import CONFIG from "../js_shared/config";
import { TileType } from "../js_shared/dict";
import Tile from "./tile";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles.slice(); }
    async generate()
    {
        this.tiles = [];

        const num = CONFIG.generation.numAsteroidTiles;
        const numEgg = Math.round(CONFIG.generation.fractionEggHatcher * num);
        for(let i = 0; i < num; i++)
        {
            const type = (i < numEgg) ? TileType.EGGHATCH : TileType.ASTEROID;
            this.tiles.push( new Tile(type) );
        }

        const numCrosshairs = 2;
        for(let i = 0; i < numCrosshairs; i++)
        {
            this.tiles.push( new Tile(TileType.CROSSHAIR) );
        }

        console.log(this.tiles);
    }
}