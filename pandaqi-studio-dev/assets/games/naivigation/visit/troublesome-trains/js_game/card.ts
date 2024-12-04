import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { GAME_DATA, MATERIAL, MISC } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import Point from "js/pq_games/tools/geometry/point";
import createContext from "js/pq_games/layout/canvas/createContext";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import { TileType } from "games/naivigation/js_shared/dictShared";

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

    getCustomIllustration(vis:MaterialVisualizer, card:MaterialNaivigation, op:LayoutOperation) : ResourceImage
    {
        if(this.key != "train") { return null; }

        const canvSize = new Point(vis.sizeUnit);
        const ctx = createContext({ size: canvSize });
        const group = new ResourceGroup();

        const trainData = this.customData.trainKeys;
        const numIcons = trainData.length;
        const positions = vis.get("cards.trainVehicle.iconPositions")[numIcons];
        const res = vis.getResource("map_tiles");
        const iconSize = vis.get("cards.trainVehicle.iconSize");
        for(let i = 0; i < numIcons; i++)
        {
            const trainKey = trainData[i];
            const op = new LayoutOperation({
                pos: positions[i],
                size: iconSize,
                frame: MATERIAL[TileType.VEHICLE][trainKey].frame,
                pivot: Point.CENTER
            });
            group.add(res, op);
        }

        // Finally, turn that all into a resource image to give back
        group.toCanvas(ctx);
        return new ResourceImage(ctx.canvas);
    }
}