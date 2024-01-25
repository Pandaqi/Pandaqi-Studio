import createContext from "js/pq_games/layout/canvas/createContext";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import { TileType } from "games/naivigation/js_shared/dictShared";

export default class Tile
{
    type: TileType
    key: string
    customData:Record<string,any>;

    constructor(t:TileType, k:string = "")
    {
        this.type = t;
        this.key = k;
    }

    isCollectible() { return this.key == "planet"; }

    async drawForRules(vis:Visualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        this.drawBackground(vis, group, ctx);
        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:Visualizer, group, ctx)
    {
        fillCanvas(ctx, "#FFFFFF");
    }
}