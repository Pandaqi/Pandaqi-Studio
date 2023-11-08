import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import Point from "js/pq_games/tools/geometry/point";
import { MISC, Type } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";

export default class Visualizer
{
    patternCat: ResourceImage

    async prepare()
    {
        await this.createCatPattern();
    }

    async createCatPattern()
    {
        const patternSize = (1.0 + CONFIG.cards.bgCats.patternExtraMargin) * CONFIG.cards.size.y;
        const num = CONFIG.cards.bgCats.patternNumIcons;
        const distBetweenIcons = patternSize / num;
        const iconSize = CONFIG.cards.bgCats.patternIconSize * distBetweenIcons;

        const ctx = createContext({ size: new Point(patternSize) });
        for(let x = 0; x < num; x++)
        {
            for(let y = 0; y < num; y++)
            {
                const res = CONFIG.resLoader.getResource("misc");
                const pos = new Point(x,y).scaleFactor(distBetweenIcons);
                const frame = MISC.bg_cat.frame;
                const op = new LayoutOperation({
                    frame: frame,
                    translate: pos,
                    dims: new Point(iconSize),
                    pivot: new Point(0.5),
                })
                await res.toCanvas(ctx, op);
            }
        }

        const img = await convertCanvasToImage(ctx.canvas);
        const res = new ResourceImage(img);
        this.patternCat = res;
    }
}