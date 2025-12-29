
import { MaterialVisualizer, ResourceGroup, LayoutOperation, Vector2, TextConfig, ResourceText } from "lib/pq-games";
import { MISC_SHARED } from "./dictShared";
import MaterialEaster from "./materialEaster";

export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    if(!tile.needsText(vis)) { return; }

    const data = tile.getData();

    // the background
    const resMisc = vis.getResource("misc");
    const bgOp = new LayoutOperation({
        pos: vis.get("tiles.text.pos"),
        frame: MISC_SHARED.text_bg.frame,
        size: vis.get("tiles.text.bgDims"),
        pivot: Vector2.CENTER
    })
    group.add(resMisc, bgOp);

    // the actual power text
    const text = tile.getText() ?? data.desc;
    const textConfig = new TextConfig({
        font: vis.get("fonts.body"),
        size: vis.get("tiles.text.fontSize")
    }).alignCenter();

    const textColor = "#000000";
    const resText = new ResourceText({ text: text, textConfig: textConfig });
    const textOp = new LayoutOperation({
        pos: vis.get("tiles.text.pos"),
        size: vis.get("tiles.text.size"),
        pivot: Vector2.CENTER,
        fill: textColor,
    })

    group.add(resText, textOp);
}