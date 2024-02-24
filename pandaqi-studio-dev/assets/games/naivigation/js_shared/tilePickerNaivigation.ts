import { TileType } from "games/naivigation/js_shared/dictShared";
import Tile from "../visit/swerving-spaceships/js_game/tile";

interface DictData
{
    type: TileType,
    dict: Record<string,any>
}

export default class TilePickerNaivigation
{
    tiles: Tile[]
    config: any;
    tileClass: any;
    data: DictData[];
    mapCallback: Function = (key, data) => { return null; } // for custom callbacks for map tiles to be made

    constructor(config, tileClass) 
    {
        this.config = config;
        this.tileClass = tileClass;
        this.data = [];
    }

    get() { return this.tiles; }
    generate()
    {
        this.tiles = [];
        this.generateVehicleTiles();
        for(const data of this.data) { this.generateTiles(data); }
        return this.tiles;
    }

    setCustomCallback(cb) { this.mapCallback = cb; }
    addData(type:TileType = TileType.MAP, dict:Record<string,any>)
    {
        this.data.push({
            type: type,
            dict: dict
        })
    }

    generateVehicleTiles()
    {
        if(!this.config.includeVehicleTiles || !this.config.includeMapTiles) { return; }

        const num = this.config.tiles.generation.numUniqueVehicles ?? 3;
        for(let i = 0; i < num; i++)
        {
            const newTile = new this.tileClass(TileType.VEHICLE);
            newTile.customData = { num: i };
            this.tiles.push(newTile);
        }
    }

    generateTiles(inputData:DictData)
    {
        if(!this.config.includeMapTiles) { return; }
        
        const tileType = inputData.type;
        for(const [key,data] of Object.entries(inputData.dict))
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
                const newTile = new this.tileClass(tileType, key);
                this.tiles.push(newTile);
            }
        }
    }
}