import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { MISC_SHARED } from "./dictShared";
import MaterialEaster from "./materialEaster";

export default (tile:MaterialEaster, vis:MaterialVisualizer, group:ResourceGroup) =>
{
    if(!tile.needsText(vis)) { return; }

    const data = tile.getData();

    // the background
    const resMisc = vis.getResource("misc");
    const bgOp = new LayoutOperation({
        translate: vis.get("tiles.text.translate"),
        frame: MISC_SHARED.text_bg.frame,
        dims: vis.get("tiles.text.bgDims"),
        pivot: Point.CENTER
    })
    group.add(resMisc, bgOp);

    // the actual power text
    const text = tile.getText() ?? data.desc;
    const textConfig = new TextConfig({
        font: vis.get("fonts.body"),
        size: vis.get("tiles.text.fontSize")
    }).alignCenter();

    const resText = new ResourceText({ text: text, textConfig: textConfig });
    const textOp = new LayoutOperation({
        translate: vis.get("tiles.text.translate"),
        dims: vis.get("tiles.text.dims"),
        pivot: Point.CENTER,
        fill: "#000000",
    })

    group.add(resText, textOp);
}