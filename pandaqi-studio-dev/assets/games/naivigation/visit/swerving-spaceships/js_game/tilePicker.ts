import { TileType } from "games/naivigation/js_shared/dictShared";
import CONFIG from "../js_shared/config";
import { MAP_TILES } from "../js_shared/dict";
import Tile from "./tile";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles; }
    async generate()
    {
        this.tiles = [];
        this.generateVehicleTiles();
        this.generateMapTiles();
    }

    // @TODO: these things are ripe for standardization across all Naivigation games, right?
    generateVehicleTiles()
    {
        if(!CONFIG.includeVehicleTiles) { return; }

        const num = CONFIG.tiles.generation.numUniqueVehicles ?? 2;
        for(let i = 0; i < num; i++)
        {
            const newTile = new Tile(TileType.VEHICLE);
            newTile.customData = { num: i };
            this.tiles.push(newTile);
        }
    }

    generateMapTiles()
    {
        if(!CONFIG.includeMapTiles) { return; }
        
        for(const [key,data] of Object.entries(MAP_TILES))
        {
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newTile = new Tile(TileType.MAP, key);
                this.tiles.push(newTile);
            }
        }
    }
}