import createContext from "js/pq_games/layout/canvas/createContext";
import { PowerData } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";

export default class Card
{
    type: string;
    data: PowerData;
    ctx: CanvasRenderingContext2D;

    constructor(type:string, data:PowerData)
    {
        this.type = type;
        this.data = data;
    }

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;

        let color = "#FFFFFF";
        fillCanvas(this.ctx, color);

        // @TODO
        this.drawOutline(vis);
        
        return this.getCanvas();
    }


    getCanvas() { return this.ctx.canvas; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;

        await this.drawBackground(vis);

        // @TODO

        this.drawOutline(vis);

        return this.getCanvas();
    }


    async drawBackground(vis:Visualizer)
    {
        // first solid color
        let color = "#FFFFFF"; // @TODO
        fillCanvas(this.ctx, color);
    }

    drawOutline(vis:Visualizer)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}