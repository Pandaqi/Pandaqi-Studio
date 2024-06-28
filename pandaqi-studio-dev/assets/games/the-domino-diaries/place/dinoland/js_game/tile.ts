import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { MISC, TileType } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";

export default class Tile
{
    type: TileType

    constructor(type:TileType)
    {
        this.type = type;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        // simply display the right pre-made sprite; that's all
        let key = "";
        if(this.type == TileType.ASTEROID) { key = "asteroid_tile" }
        else if(this.type == TileType.CROSSHAIR) { key = "asteroid_crosshairs" }
        else if(this.type == TileType.EGGHATCH) { key = "asteroid_egg_hatch" }

        const res = vis.getResource("misc");
        const op = new LayoutOperation({
            frame: MISC[key].frame,
            dims: vis.size,
        })
        group.add(res, op);

        group.toCanvas(ctx);
        return ctx.canvas;
    }
}