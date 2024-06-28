import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { AnimalType } from "../js_shared/dict";

export default class Tile
{
    animal: AnimalType

    constructor(a:AnimalType)
    {
        this.animal = a;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        // @TODO: display the detail tile for this animal

        group.toCanvas(ctx);
        return ctx.canvas;
    }
}