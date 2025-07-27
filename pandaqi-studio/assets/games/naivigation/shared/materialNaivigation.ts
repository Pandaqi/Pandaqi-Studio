import { TEMPLATES } from "./dict";
import { MaterialNaivigationType, NetworkType, TERRAINS, TerrainType } from "./dictShared";
import { TileData } from "./randomNaivigationSetupGenerator";

export default class MaterialNaivigation
{
    type: MaterialNaivigationType;
    key: string;
    randomSeed: number;
    terrain: TerrainType;
    networkType: NetworkType; // the connections
    networkKey: string; // the unique (game-specific) _type_ of network, such as "dirt road vs asphalt road"
    elevation: number;
    customData:Record<string,any>;

    // global switches for major visual changes => @TODO: might become a single object later, or something better, but this is fine for now
    illustrationUsesGlow = false;
    terrainUsesGrayscale = false;

    constructor(t:MaterialNaivigationType, k:string = "", cd:Record<string,any> = {})
    {
        this.type = t;
        this.key = k;
        this.customData = cd;
        
        // this is to "fix" any randomly determined attributes upon creation, instead of picking new ones every time we draw it (which is inconsistent with interactive examples in rulebooks, for example) 
        this.generateRandomSeed(); 
    }

    isCollectible() : boolean { return (this.getData() ?? {}).collectible ?? false; }
    canCollect(playerTokenData:TileData) : boolean { return true; }
    
    isStartingTile() : boolean { return (this.getData() ?? {}).starting ?? false; }
    
    getData() { return null; }
    getMisc() { return null; }
    getGameData() { return null; }
    getTemplateData() { return TEMPLATES[this.type]; }
    getNetworkData() { return null; }
    getCustomBackground(vis, group) { return null; }
    getCustomIllustration(vis, spriteOp) { return null; }
    getCustomForeground(vis, group) { return null; }

    getTerrain() { return this.terrain; }
    hasTerrain() { return this.terrain && this.terrain != TerrainType.NONE; }
    getElevation() { return this.elevation ?? TERRAINS[this.terrain ?? TerrainType.NONE].elevation ?? 0; }
    setTerrain(t:TerrainType) { this.terrain = t; }
    setElevation(e:number) { this.elevation = e; }
    setNetwork(t:NetworkType, k:string)
    {
        this.networkType = t ?? NetworkType.NONE;
        this.networkKey = k ?? "";
    }
    hasNetwork() { return this.networkType && this.networkType != NetworkType.NONE; }

    addCustomData(cd:Record<string,any> = {}) { Object.assign(this.customData, cd); }
    getCustomData() { return structuredClone(this.customData); }

    generateRandomSeed() { this.randomSeed = Math.floor(Math.random()*128); }
    getSeed() { return this.randomSeed }

    async drawForRules(vis) : Promise<HTMLCanvasElement> { return this.draw(vis); }
    async draw(vis) : Promise<HTMLCanvasElement> { return document.createElement("canvas"); }

}