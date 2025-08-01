import createContext from "js/pq_games/layout/canvas/createContext";
import { CONFIG } from "../shared/config";
import Point from "js/pq_games/tools/geometry/point";
import { MISC, Type } from "../shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";

export default class Visualizer
{
    patternCat: ResourceImage
    size: Point
    sizeUnit: number
    center: Point
    resLoader: ResourceLoader;
    inkFriendly: boolean;

    constructor(r:ResourceLoader, itemSize:Point, inkFriendly:boolean)
    {
        this.resLoader = r;
        this.inkFriendly = inkFriendly;
        this.size = itemSize;
        this.sizeUnit = Math.min(itemSize.x, itemSize.y);
        this.center = this.size.clone().scale(0.5);
    }

    async prepare()
    {
        await this.createCatPattern();
    }

    async createCatPattern()
    {
        const patternSize = (1.0 + CONFIG.cards.bgCats.patternExtraMargin) * this.size.y;
        const num = CONFIG.cards.bgCats.patternNumIcons;
        const distBetweenIcons = patternSize / num;
        const iconSize = CONFIG.cards.bgCats.patternIconSize * distBetweenIcons;

        const ctx = createContext({ size: new Point(patternSize) });
        for(let x = 0; x < num; x++)
        {
            for(let y = 0; y < num; y++)
            {
                const res = this.resLoader.getResource("misc");
                const pos = new Point(x,y).scaleFactor(distBetweenIcons);
                const frame = MISC.bg_cat.frame;
                const op = new LayoutOperation({
                    frame: frame,
                    pos: pos,
                    size: new Point(iconSize),
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