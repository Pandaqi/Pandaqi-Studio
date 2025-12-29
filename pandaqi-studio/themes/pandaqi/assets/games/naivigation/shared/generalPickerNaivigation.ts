import { CardType, MaterialNaivigationData, MaterialNaivigationType, NetworkType, TerrainType, TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "./materialNaivigation";
import { shuffle, fromArray } from "lib/pq-games";

interface DictData
{
    type: MaterialNaivigationType,
    dict: Record<string,any>
}

interface ExtraDataParams
{
    perc?: number, // an exact percentage of total that must be filled
    prob?: number, // (or) a random drawing probability; defaults to 1
    filterInclude?: string[], // only add this type on these map tiles
    filterExclude?: string[], // NEVER add this type on these map tiles
    filterCollectibles?: string, // "include" or "exclude"
}

type ExtraData = Record<string, ExtraDataParams>
const SPECIAL_CARD_TYPES = [CardType.ACTION, CardType.GPS, CardType.HEALTH, CardType.TIME];

export default class GeneralPickerNaivigation
{
    elements: MaterialNaivigation[]
    config: any;
    elementClass: any;
    data: DictData[];
    generateCallback: Function
    mapCallback: Function = (key, data) => { return null; } // for custom callbacks for map tiles to be made
    terrainData:ExtraData
    networkTypeData:ExtraData
    networkKeyData:ExtraData

    constructor(config, elemClass) 
    {
        this.config = config;
        this.elementClass = elemClass;
        this.data = [];
    }

    // easy bridge to the new Pandaqi system where all pickers are just plain functions (inside functions)
    asFunction() { return () => () => this.generate(); }

    get() { return this.elements; }
    generate()
    {
        this.elements = [];
        for(const data of this.data) { this.generateMaterial(data); }
        this.assignTerrains();
        this.assignNetworks();
        if(this.generateCallback) { this.generateCallback(); }
        console.log(this.elements);
        return this.elements;
    }

    setCustomCallback(cb) { this.mapCallback = cb; }
    addData(type:MaterialNaivigationType, dict:Record<string,any>)
    {
        this.data.push({
            type: type,
            dict: dict
        })
        return this;
    }

    addMaterialData(filter:string, dict:Record<string,MaterialNaivigationData>)
    {
        for(const [key,data] of Object.entries(dict))
        {
            if(filter == "card" && !Object.values(CardType).includes(key as CardType)) { continue; }
            if(filter == "tile" && !Object.values(TileType).includes(key as TileType)) { continue; }
            this.addData(key as MaterialNaivigationType, data);
        }
        return this;
    }

    addSingle(elem:MaterialNaivigation)
    {
        this.elements.push(elem);
        return this;
    }

    addTerrainData(td:ExtraData = {})
    {
        const shouldConstructRandom = Object.keys(td).length <= 0;
        if(shouldConstructRandom)
        {
            for(const value of Object.values(TerrainType))
            {
                td[value] = { prob: Math.round(1 + 4*Math.random()) }
            }
        }

        this.terrainData = td;
        return this;
    }

    addNetworkData(nd:ExtraData = {}, kd:ExtraData = {})
    {
        // @IMPROV: this is now just a copy-paste of terrainData => if I need this more often, generalize/optimize
        const shouldConstructRandom = Object.keys(nd).length <= 0;
        if(shouldConstructRandom)
        {
            for(const value of Object.values(NetworkType))
            {
                nd[value] = { prob: Math.round(1 + 4*Math.random()) }
            }
        }

        this.networkTypeData = nd;
        this.networkKeyData = kd;
        return this;
    }

    getMapTiles()
    {
        return this.elements.filter((e:MaterialNaivigation) => e.type == TileType.MAP);
    }

    assignTerrains()
    {
        if(!this.terrainData) { return; }
        
        // collect map tiles only
        const mapTiles = this.getMapTiles();
        const possibleTerrains = Object.keys(this.terrainData);
        const numTiles = mapTiles.length;

        // create list with everything in correct numbers
        const terrainTypes = this.createExtraDataList(this.terrainData, possibleTerrains, numTiles);

        // cache the list of allowed terrains per tile type (so finding the first suitable one is really cheap below)
        const terrainsAllowedPerTile = this.createExtraDataCache(this.terrainData, mapTiles, possibleTerrains);

        // actually assign these to tiles, keeping the filters in mind
        for(const tile of mapTiles)
        {
            const terrain = this.takeFirstValidOption(terrainsAllowedPerTile[tile.key], terrainTypes);
            tile.setTerrain(terrain as TerrainType);
        }
    }

    assignNetworks()
    {
        if(!this.networkTypeData) { return; }

        const mapTiles = this.getMapTiles();
        const numTiles = mapTiles.length;

        // first the type (crossroads, deadend, etc)
        const possibleNetworks = Object.keys(this.networkTypeData);
        const networkTypes = this.createExtraDataList(this.networkTypeData, possibleNetworks, numTiles);
        const networksAllowedPerTile = this.createExtraDataCache(this.networkTypeData, mapTiles, possibleNetworks);

        // then the key, specific to the game (dirt road, quick road, etc)
        const possibleNetworkKeys = Object.keys(this.networkKeyData);
        const networkKeys = this.createExtraDataList(this.networkKeyData, possibleNetworkKeys, numTiles);
        const networkKeysAllowedPerTile = this.createExtraDataCache(this.networkKeyData, mapTiles, possibleNetworkKeys);

        for(const tile of mapTiles)
        {
            const networkType = this.takeFirstValidOption(networksAllowedPerTile[tile.key], networkTypes);
            const networkKey = this.takeFirstValidOption(networkKeysAllowedPerTile[tile.key], networkKeys);
            tile.setNetwork(networkType as NetworkType, networkKey);
        }
    }

    createExtraDataList(dataAll:ExtraData, options:string[], num:number)
    {
        const allTypes = [];
        for(const type of options)
        {
            const data = dataAll[type];
            let numOfType = 0;

            if(data.prob)
            {
                for(let i = 0; i < num; i++)
                {
                    if(Math.random() <= data.prob) { continue; }
                    numOfType++;
                }    
            } 

            if(data.perc)
            {
                numOfType = Math.ceil(data.perc * num);
            }
            
            for(let i = 0; i < numOfType; i++)
            {
                allTypes.push(type);
            }
        }
        shuffle(allTypes);
        return allTypes;
    }

    createExtraDataCache(dataAll:ExtraData, elements:MaterialNaivigation[], options:string[])
    {
        const typesAllowedPerTile = {};
        for(const element of elements)
        {
            const key = element.key;
            const arr = [];
            for(const type of options)
            {
                const data = dataAll[type];
                if(data.filterInclude && !data.filterInclude.includes(key)) { continue; }
                if(data.filterExclude && data.filterExclude.includes(key)) { continue; }
                if(data.filterCollectibles)
                {
                    if(element.isCollectible() && data.filterCollectibles == "exclude") { continue; }
                    if(!element.isCollectible() && data.filterCollectibles == "include") { continue; }
                }
                arr.push(type);
            }
            typesAllowedPerTile[key] = arr;
        }
        return typesAllowedPerTile;
    }

    takeFirstValidOption(typesAllowed:string[], typesPossible:string[])
    {
        if(typesAllowed.length <= 0) { return ""; }
        for(let i = 0; i < typesPossible.length; i++)
        {
            const type = typesPossible[i];
            if(!typesAllowed.includes(type)) { continue; }
            typesPossible.splice(i, 1);
            return type;
        }
        return fromArray(typesAllowed);
    }

    generateMaterial(inputData:DictData)
    {
        const materialType = inputData.type;
        const isVehiclePawn = materialType == TileType.VEHICLE;
        const isSpecialCard = SPECIAL_CARD_TYPES.includes(materialType as CardType);

        // @NOTE: this is tricky; all regular cards are generated with vehicleCards (if true), only MAP tiles are different and have their own toggle
        let defaultSets = isSpecialCard ? ["specialCards"] : ["vehicleCards"];
        if(materialType == TileType.MAP) { defaultSets = ["mapTiles"]; }
        
        for(const [key,data] of Object.entries(inputData.dict))
        {            
            // filter based on sets
            const setsTarget = data.sets ?? defaultSets;
            let shouldInclude = false;
            for(const set of setsTarget)
            {
                if(this.config.sets[set]) { shouldInclude = true; break; }
            }
            
            // handy default settings to toggle an entire section on/off, available in all settings blocks
            if(isVehiclePawn) { shouldInclude = shouldInclude && this.config.sets.vehicleTiles; }
            if(isSpecialCard) { shouldInclude = shouldInclude && this.config.sets.specialCards; }
            
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
                const newTile = new this.elementClass(materialType, key);
                this.elements.push(newTile);
            }
        }
    }
}