
import { LayoutOperation, MaterialVisualizer, ResourceGroup, ResourceText, TextConfig, TextWeight, Vector2 } from "lib/pq-games";
import MaterialEaster from "./materialEaster";

export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    const typeData = tile.getTypeData();
    const textConfig = new TextConfig({
        font: vis.get("fonts.heading"),
        size: vis.get("tiles.typeText.fontSize"),
        weight: TextWeight.BOLD
    }).alignCenter();

    const resTypeText = new ResourceText({ text: typeData.label, textConfig: textConfig });
    const typeTextOffsetY = vis.get("tiles.typeText.edgeOffsetY");

    let color = tile.invertColors() ? "#FFFFFF" : "#000000";
    if(vis.inkFriendly) { color = "#000000"; }
    let alpha = vis.get("tiles.typeText.alpha");
    if(vis.inkFriendly) { alpha *= 0.5; }
    const composite = vis.inkFriendly ? "source-over" : vis.get("tiles.typeText.composite");

    for(let i = 0; i < 2; i++)
    {
        if(tile.needsText(vis) && i > 0) { break; } // if text at bottom, no space for this as well

        const yPos = i == 0 ? typeTextOffsetY : (vis.size.y - typeTextOffsetY);
        const pos = new Vector2(vis.center.x, yPos);

        const op = new LayoutOperation({
            pos: pos,
            size: new Vector2(0.5*vis.size.x, 2*textConfig.size),
            pivot: Vector2.CENTER,
            alpha: alpha,
            composite: composite,
            rot: (i == 0 ? 0 : Math.PI),
            fill: color
        })
        group.add(resTypeText, op);
    }
}