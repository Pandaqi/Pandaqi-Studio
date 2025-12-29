
import { MaterialVisualizer, ResourceGroup, LayoutOperation } from "lib/pq-games";
import MaterialEaster from "./materialEaster";

// extremely simple, just the one egg sprite
export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    const res = vis.getResource("eggs");
    const op = new LayoutOperation({
        size: vis.size,
        frame: tile.getData().frame,
        effects: vis.inkFriendlyEffect
    })
    group.add(res, op);
}