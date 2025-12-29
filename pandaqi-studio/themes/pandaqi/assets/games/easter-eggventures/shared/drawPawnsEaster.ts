
import { MaterialVisualizer, ResourceGroup, Vector2, LayoutOperation } from "lib/pq-games";
import MaterialEaster from "./materialEaster";

export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    // the pawn is just a 1024x1024 texture of which the left column is completely predetermined
    // and it just places that + a copy to the right
    const res = vis.getResource("pawns");
    let positions = [new Vector2(), new Vector2(vis.center.x, 0)];
    for(let i = 0; i < 2; i++)
    {
        const op = new LayoutOperation({
            pos: positions[i],
            frame: tile.num ?? tile.customData.playerNum,
            size: vis.size,
            effects: vis.inkFriendlyEffect
        })

        group.add(res, op);
    }
}