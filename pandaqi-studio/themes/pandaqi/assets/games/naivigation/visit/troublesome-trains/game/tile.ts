import { TileType } from "games/naivigation/shared/dictShared";
import MaterialNaivigation from "games/naivigation/shared/materialNaivigation";
import pawnDrawerNaivigation from "games/naivigation/shared/pawnDrawerNaivigation";
import tileDrawerNaivigation from "games/naivigation/shared/tileDrawerNaivigation";
import { MATERIAL, MISC, NETWORK_TYPES } from "../shared/dict";
import { MaterialVisualizer, ResourceGroup, LayoutOperation, Vector2 } from "lib/pq-games";

export default class Tile extends MaterialNaivigation
{
    terrainUsesGrayscale = true

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
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: MISC[key + "_template"].frame,
            effects: vis.inkFriendlyEffect
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
                pivot: Vector2.CENTER
            });
            group.add(res, op);
        }
    }
}