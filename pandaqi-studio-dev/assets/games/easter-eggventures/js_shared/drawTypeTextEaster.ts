import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
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
        const pos = new Point(vis.center.x, yPos);

        const op = new LayoutOperation({
            translate: pos,
            dims: new Point(0.5*vis.size.x, 2*textConfig.size),
            pivot: Point.CENTER,
            alpha: alpha,
            composite: composite,
            rotation: (i == 0 ? 0 : Math.PI),
            fill: color
        })
        group.add(resTypeText, op);
    }
}