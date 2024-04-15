import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import MaterialEaster from "./materialEaster";

export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    // the pawn is just a 1024x1024 texture of which the left column is completely predetermined
    // and it just places that + a copy to the right
    const res = vis.getResource("pawns");
    let positions = [new Point(), new Point(vis.center.x, 0)];
    for(let i = 0; i < 2; i++)
    {
        const op = new LayoutOperation({
            translate: positions[i],
            frame: tile.num ?? tile.customData.playerNum,
            dims: vis.size,
            effects: vis.inkFriendlyEffect
        })

        group.add(res, op);
    }
}