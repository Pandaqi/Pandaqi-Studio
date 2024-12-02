import { TEMPLATES } from "./dict";
import { MaterialNaivigationType, TERRAINS, TerrainType } from "./dictShared";
import { TileData } from "./randomNaivigationSetupGenerator";

export default class MaterialNaivigation
{
    type: MaterialNaivigationType;
    key: string;
    randomSeed: number;
    terrain: TerrainType;
    elevation: number;
    customData:Record<string,any>;

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
    getCustomIllustration(vis, card, spriteOp) { return null; }

    getTerrain() { return this.terrain; }
    getElevation() { return this.elevation ?? TERRAINS[this.terrain].elevation ?? 0; }
    setTerrain(t:TerrainType) { this.terrain = t; }
    setElevation(e:number) { this.elevation = e; }

    addCustomData(cd:Record<string,any> = {}) { Object.assign(this.customData, cd); }
    getCustomData() { return structuredClone(this.customData); }

    generateRandomSeed() { this.randomSeed = Math.floor(Math.random()*128); }
    getSeed() { return this.randomSeed }

    async drawForRules(vis) : Promise<HTMLCanvasElement> { return this.draw(vis); }
    async draw(vis) : Promise<HTMLCanvasElement> { return document.createElement("canvas"); }

}