import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { SYMBOLS } from "../js_shared/dict";

export default class Card
{
    symbol: string;

    constructor(sym:string)
    {
        this.symbol = sym;
    }

    getActionData() { return SYMBOLS[this.symbol] ?? {}; }
    hasSpecialAction() { return Object.keys(this.getActionData()).length > 0; }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        // @TODO
        return vis.renderer.finishDraw(group);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }

    drawSymbol(vis:MaterialVisualizer, group:ResourceGroup)
    {
        
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasSpecialAction()) { return; }
    }
}