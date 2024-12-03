import { TileType } from "games/naivigation/js_shared/dictShared";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import pawnDrawerNaivigation from "games/naivigation/js_shared/pawnDrawerNaivigation";
import tileDrawerNaivigation from "games/naivigation/js_shared/tileDrawerNaivigation";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { MATERIAL, MISC } from "../js_shared/dict";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";

export default class Tile extends MaterialNaivigation
{
    getData() { return MATERIAL[this.type][this.key]; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        if(this.type == TileType.MAP || this.type == TileType.VEHICLE) {
            tileDrawerNaivigation(vis, group, this);
        } else if(this.type == TileType.PAWN) {
            pawnDrawerNaivigation(vis, group, this);
        } else if(this.type == TileType.CUSTOM) {
            this.drawCustomTile(vis, group);
        }
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    // draws the ELEVATION and CLOCK special deck tiles
    drawCustomTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the background template
        const resBG = vis.getResource("misc");
        const opBG = new LayoutOperation({
            size: vis.size,
            frame: MISC[this.key + "_template"].frame
        })
        group.add(resBG, opBG);

        const isClockCard = (this.key == "clock");

        // the specific text
        const val = this.customData.num;
        let str = val.toString();
        if(isClockCard && val >= 0) { str = "+" + str; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.custom.fontSize")
        }).alignCenter();
        const resText = new ResourceText(str, textConfig);

        // @TODO: different colors for text?
        const opText = new LayoutOperation({
            pos: vis.center,
            size: vis.size,
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: vis.get("tiles.custom.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        group.add(resText, opText);
    }
}