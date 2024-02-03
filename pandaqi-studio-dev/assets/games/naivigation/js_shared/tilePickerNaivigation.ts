import { TileType } from "games/naivigation/js_shared/dictShared";
import Tile from "../visit/swerving-spaceships/js_game/tile";

export default class TilePickerNaivigation
{
    tiles: Tile[]
    config: any;
    tileClass: any;
    mapDict: Record<string,any>;
    mapCallback: Function = (key, data) => { return null; } // for custom callbacks for map tiles to be made

    constructor(config, tileClass, mapDict) 
    {
        this.config = config;
        this.tileClass = tileClass;
        this.mapDict = mapDict;
    }

    get() { return this.tiles; }
    generate()
    {
        this.tiles = [];
        this.generateVehicleTiles();
        this.generateMapTiles();
        return this.tiles;
    }

    generateVehicleTiles()
    {
        if(!this.config.includeVehicleTiles) { return; }

        const num = this.config.tiles.generation.numUniqueVehicles ?? 3;
        for(let i = 0; i < num; i++)
        {
            const newTile = new this.tileClass(TileType.VEHICLE);
            newTile.customData = { num: i };
            this.tiles.push(newTile);
        }
    }

    generateMapTiles()
    {
        if(!this.config.includeMapTiles) { return; }
        
        for(const [key,data] of Object.entries(this.mapDict))
        {
            const res = this.mapCallback(key, data);
            if(res)
            {
                for(const elem of res) { this.tiles.push(elem); }
                continue;
            }

            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newTile = new this.tileClass(TileType.MAP, key);
                this.tiles.push(newTile);
            }
        }
    }
}