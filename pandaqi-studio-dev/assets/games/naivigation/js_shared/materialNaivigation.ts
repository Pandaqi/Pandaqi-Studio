import { TEMPLATES } from "./dict";
import { MaterialNaivigationType } from "./dictShared";
import { TileData } from "./randomNaivigationSetupGenerator";

export default class MaterialNaivigation
{
    type: MaterialNaivigationType;
    key: string;
    randomSeed: number;
    customData:Record<string,any>;

    constructor(t:MaterialNaivigationType, k:string = "", cd:Record<string,any> = {})
    {
        this.type = t;
        this.key = k;
        this.customData = cd;
        this.randomSeed = Math.floor(Math.random()*128); // this is to "fix" any randomly determined attributes upon creation, instead of picking new ones every time we draw it (which is inconsistent with interactive examples in rulebooks, for example) 
    }

    isCollectible() : boolean { return false; }
    canCollect(playerTokenData:TileData) : boolean { return true; }
    isStartingTile() : boolean { return false; }
    getData() { return; }
    getMisc() { return; }
    getGameData() { return; }
    getTemplateData() { return TEMPLATES[this.type]; }

    async drawForRules(vis) : Promise<HTMLCanvasElement> { return this.draw(vis); }
    async draw(vis) : Promise<HTMLCanvasElement> { return document.createElement("canvas"); }

}