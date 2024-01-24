import createContext from "js/pq_games/layout/canvas/createContext";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import { CardType } from "games/naivigation/js_shared/dictShared";

export default class Card
{
    type: CardType
    key: string
    customData:Record<string,any>;

    constructor(t:CardType, k:string = "")
    {
        this.type = t;
        this.key = k;
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