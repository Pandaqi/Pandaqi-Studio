import { MaterialNaivigationData, MaterialNaivigationType, TileType } from "games/naivigation/js_shared/dictShared";
import MaterialNaivigation from "./materialNaivigation";

interface DictData
{
    type: MaterialNaivigationType,
    dict: Record<string,any>
}

export default class GeneralPickerNaivigation
{
    elements: MaterialNaivigation[]
    config: any;
    elementClass: any;
    data: DictData[];
    generateCallback: Function
    mapCallback: Function = (key, data) => { return null; } // for custom callbacks for map tiles to be made

    constructor(config, elemClass) 
    {
        this.config = config;
        this.elementClass = elemClass;
        this.data = [];
    }

    get() { return this.elements; }
    generate()
    {
        this.elements = [];
        for(const data of this.data) { this.generateMaterial(data); }
        if(this.generateCallback) { this.generateCallback(); }
        return this.elements;
    }

    setCustomCallback(cb) { this.mapCallback = cb; }
    addData(type:MaterialNaivigationType, dict:Record<string,any>)
    {
        this.data.push({
            type: type,
            dict: dict
        })
    }

    addMaterialData(dict:Record<string,MaterialNaivigationData>)
    {
        for(const [key,data] of Object.entries(dict))
        {
            if(!Object.values(TileType).includes(key as TileType)) { continue; }
            this.addData(key as TileType, data);
        }
        return this;
    }

    addSingle(elem:MaterialNaivigation)
    {
        this.elements.push(elem);
    }

    generateMaterial(inputData:DictData)
    {
        const tileType = inputData.type;
        const defaultSets = ["vehicleCards", "mapTiles"];
        for(const [key,data] of Object.entries(inputData.dict))
        {            
            // filter based on sets
            const setsTarget = data.sets ?? defaultSets;
            let shouldInclude = false;
            for(const set of setsTarget)
            {
                if(this.config.sets[set]) { shouldInclude = true; break; }
            }
            if(tileType == TileType.VEHICLE) { shouldInclude = this.config.sets.vehicleTiles; }
            if(!shouldInclude) { continue; }

            // hook for custom handling of certain tiles
            let res = this.mapCallback(key, data);
            if(res)
            {
                if(!Array.isArray(res)) { res = [res]; }
                for(const elem of res) { this.elements.push(elem); }
                continue;
            }

            // otherwise, just create tiles as stated, at frequency wanted (default 1)
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newTile = new this.elementClass(tileType, key);
                this.elements.push(newTile);
            }
        }
    }
}