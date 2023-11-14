import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Visualizer from "./visualizer";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";


export default class Tile
{
    ctx: CanvasRenderingContext2D;

    constructor()
    {
    }

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;
        // @TODO;
        
        return this.getCanvas();
    }

    getCanvas() { return this.ctx.canvas; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;

        await this.drawBackground(vis);
        // @TODO;
        this.drawOutline(vis);

        return this.getCanvas();
    }

    async drawBackground(vis:Visualizer)
    {
        // first solid color
        let color = "#00FF00";
        fillCanvas(this.ctx, color);
    }

    drawOutline(vis:Visualizer)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}