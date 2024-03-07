import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import MaterialEaster from "./materialEaster";

// extremely simple, just the one egg sprite
export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    const res = vis.getResource("eggs");
    const op = new LayoutOperation({
        dims: vis.size,
        frame: tile.getData().frame
    })
    group.add(res, op);
}