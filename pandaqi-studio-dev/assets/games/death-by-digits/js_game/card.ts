import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { EXPANSION } from "../js_shared/dict";

export default class Card
{
    key: string;
    num: number;

    constructor(num:number = 1, key:string = "")
    {
        this.num = num;
        this.key = key;
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    getNumber()
    {
        if(this.key) { return EXPANSION[this.key].num; }
        return this.num ?? 1;
    }

    getActionText()
    {
        return EXPANSION[this.key].desc;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        // @TODO

        group.toCanvas(ctx);
        return ctx.canvas;
    }
}