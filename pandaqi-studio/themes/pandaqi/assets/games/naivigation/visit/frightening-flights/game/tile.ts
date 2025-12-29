import { TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import pawnDrawerNaivigation from "games/naivigation/shared/pawnDrawerNaivigation";
import tileDrawerNaivigation from "games/naivigation/shared/tileDrawerNaivigation";
import { MATERIAL, MISC } from "../shared/dict";
import { MaterialVisualizer, ResourceGroup, LayoutOperation, TextConfig, ResourceText, StrokeAlign, Vector2 } from "lib/pq-games";

export default class Tile extends MaterialNaivigation
{
    getData() { return MATERIAL[this.type][this.key] ?? []; }
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
            pivot: Vector2.ZERO,
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

        const opText = new LayoutOperation({
            pos: vis.center,
            size: vis.size,
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: vis.get("tiles.custom.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Vector2.CENTER
        });
        group.add(resText, opText);
    }
}