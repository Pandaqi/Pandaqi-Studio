import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ActionType, ColorType, TileType } from "../js_shared/dict";

export default class Tile
{
    type:TileType
    color:ColorType
    actions:ActionType[]

    constructor(type:TileType, color:ColorType, actions:ActionType[] = [])
    {
        this.type = type ?? TileType.KRAKEN;
        this.color = color ?? ColorType.RED;
        this.actions = actions ?? [];
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
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