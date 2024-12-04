import { TileType } from "games/naivigation/js_shared/dictShared";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import pawnDrawerNaivigation from "games/naivigation/js_shared/pawnDrawerNaivigation";
import tileDrawerNaivigation from "games/naivigation/js_shared/tileDrawerNaivigation";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import { MATERIAL, MISC, NETWORK_TYPES } from "../js_shared/dict";

export default class Tile extends MaterialNaivigation
{
    getData() { return MATERIAL[this.type][this.key]; }
    getNetworkData() { return NETWORK_TYPES[this.networkKey]; }
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

    // draws the SWITCH and TRAIN special deck tiles
    drawCustomTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the background template
        let key = this.key;
        if(key == "switch") { key += "_" + this.customData.num;}

        const resBG = vis.getResource("misc");
        const opBG = new LayoutOperation({
            size: vis.size,
            frame: MISC[key + "_template"].frame
        })
        group.add(resBG, opBG);

        const isTrainCard = (key == "train");
        if(isTrainCard)
        {
            const res = vis.getResource("map_tiles");
            const trainData = MATERIAL[TileType.VEHICLE][this.customData.vehicleKey];
            const op = new LayoutOperation({
                pos: vis.center,
                size: vis.get("tiles.custom.trainIconSize"),
                frame: trainData.frame,
                pivot: Point.CENTER
            });
            group.add(res, op);
        }
    }
}