import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import Point from "js/pq_games/tools/geometry/point";
import { MISC } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import patternizeGrid from "js/pq_games/layout/patterns/patternizeGrid";

export default class Visualizer
{
    patternCat: ResourceImage
    patternHeart: ResourceImage
    patternHeartOutline: ResourceImage

    async prepare()
    {
        await this.createPatterns();
    }

    async createPatterns()
    {
        const params = {
            dims: (1.0 + CONFIG.cards.bgCats.patternExtraMargin) * CONFIG.cards.size.y,
            size: CONFIG.cards.bgCats.patternIconSize,
            num: CONFIG.cards.bgCats.patternNumIcons,
            resource: CONFIG.resLoader.getResource("misc"),
            frame: MISC.bg_cat.frame
        }

        this.patternCat = await patternizeGrid(params);

        params.frame = MISC.heart.frame;
        this.patternHeart = await patternizeGrid(params);

        params.frame = MISC.heart_outline.frame;
        this.patternHeartOutline = await patternizeGrid(params);
    }
}