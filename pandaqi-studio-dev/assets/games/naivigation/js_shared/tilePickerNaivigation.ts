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
        if(!this.config.sets.vehicleTiles) { return; }

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
        const tileType = inputData.type;
        for(const [key,data] of Object.entries(inputData.dict))
        {
            // filter based on sets
            const setsTarget = data.sets ?? ["mapTiles"];
            let shouldInclude = false;
            for(const set of setsTarget)
            {
                if(this.config.sets[set]) { shouldInclude = true; break; }
            }
            if(!shouldInclude) { continue; }

            // hook for custom handling of certain tiles
            let res = this.mapCallback(key, data);
            if(res)
            {
                if(!Array.isArray(res)) { res = [res]; }
                for(const elem of res) { this.tiles.push(elem); }
                continue;
            }

            // otherwise, just create tiles as stated, at frequency wanted (default 1)
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newTile = new this.tileClass(tileType, key);
                this.tiles.push(newTile);
            }
        }
    }
}