import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { SPECIAL_CARDS } from "../js_shared/dict";

export default class Card
{
    num:number;
    numIcons:number;
    key:string; // only used for special cards/actions

    constructor(num:number, numIcons:number, key:string = "")
    {
        this.num = num;
        this.numIcons = numIcons;
        this.key = key;
    }

    getData()
    {
        return SPECIAL_CARDS[this.key] ?? {};
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawIcons(vis, group);
        this.drawSpecial(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: just some simple template and decorations
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw numbers in corner + big number in center
    }

    drawIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.numIcons <= 0) { return; }
        // @TODO: draw the dice icon `numIcons` times, centered around center
    }

    drawSpecial(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getData();
        if(!data) { return; }

        // @TODO: show icon + text for our special type
    }


    

}