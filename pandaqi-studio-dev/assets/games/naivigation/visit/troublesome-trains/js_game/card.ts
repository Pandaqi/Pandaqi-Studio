import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import { TileType } from "games/naivigation/js_shared/dictShared";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import LayoutOperation from "lib/pq-games/layout/layoutOperation";
import ResourceGroup from "lib/pq-games/layout/resources/resourceGroup";
import MaterialVisualizer from "lib/pq-games/tools/generation/materialVisualizer";
import Point from "lib/pq-games/tools/geometry/point";
import { GAME_DATA, MATERIAL, MISC } from "../js_shared/dict";

export default class Card extends MaterialNaivigation
{
    getGameData() { return GAME_DATA; }
    getData() { return MATERIAL[this.type][this.key]; }
    getMisc() { return MISC; }
    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        cardDrawerNaivigation(vis, group, this);
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    getCustomIllustration(vis:MaterialVisualizer, op:LayoutOperation) : ResourceGroup
    {
        if(this.key != "train") { return null; }

        const sizeUnit = Math.min(op.size.x, op.size.y);
        const group = new ResourceGroup();
        const resMainIcon = vis.getResource("vehicle_cards");
        const opMainIcon = new LayoutOperation({ size: op.size, pivot: Point.CENTER });
        group.add(resMainIcon, opMainIcon);

        const trainData = this.customData.trainKeys;
        const numIcons = trainData.length;
        const positions = vis.get("cards.trainVehicle.iconPositions")[numIcons];
        const res = vis.getResource("map_tiles");
        const iconSize = new Point( vis.get("cards.trainVehicle.iconSize") * sizeUnit );
        const iconPlacementBounds = vis.get("cards.trainVehicle.iconPlacementBounds") * sizeUnit;
        for(let i = 0; i < numIcons; i++)
        {
            const trainKey = trainData[i];
            const op = new LayoutOperation({
                pos: positions[i].clone().scale(iconPlacementBounds),
                size: iconSize,
                frame: MATERIAL[TileType.VEHICLE][trainKey].frame,
                pivot: Point.CENTER
            });
            group.add(res, op);
        }
        return group;
    }
}