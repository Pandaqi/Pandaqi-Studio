import { TEMPLATES } from "./dict";
import { MaterialNaivigationType } from "./dictShared";

export default class MaterialNaivigation
{
    type: MaterialNaivigationType
    key: string
    customData:Record<string,any>;

    constructor(t:MaterialNaivigationType, k:string = "")
    {
        this.type = t;
        this.key = k;
    }

    isCollectible() : boolean { return false; }
    isStartingTile() : boolean { return false; }
    getData() { return; }
    getMisc() { return; }
    getGameData() { return; }
    getTemplateData() { return TEMPLATES[this.type]; }

    async drawForRules(vis) : Promise<HTMLCanvasElement> { return this.draw(vis); }
    async draw(vis) : Promise<HTMLCanvasElement> { return document.createElement("canvas"); }

}