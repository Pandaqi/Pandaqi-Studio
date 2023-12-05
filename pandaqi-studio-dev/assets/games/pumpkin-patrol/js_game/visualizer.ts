import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import Point from "js/pq_games/tools/geometry/point";
import { MISC, Type } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";

export default class Visualizer
{
    resLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    inkFriendly: boolean;
    patterns: Record<string, ResourceImage>;
    effects: LayoutEffect[];

    constructor(params)
    {
        this.resLoader = params.resLoader;
        this.size = params.size;
        this.sizeUnit = this.size.smallestSide();
        this.inkFriendly = params.inkFriendly;
        this.effects = [];
        if(this.inkFriendly) { this.effects.push(new GrayScaleEffect()); }
    }

    async prepare()
    {
        await this.createSidePatterns();
    }

    async createSidePatterns()
    {
        await this.createSidePattern(Type.DECORATION);
        await this.createSidePattern(Type.TREAT);
    }

    async createSidePattern(subType:Type)
    {
        const patternSize = CONFIG.cards.bgHand.patternExtraMargin * CONFIG.cards.size.x;
        const num = CONFIG.cards.bgHand.patternNumIcons;
        const distBetweenIcons = patternSize / num;
        const iconSize = CONFIG.cards.bgHand.patternIconSize * distBetweenIcons;

        const ctx = createContext({ size: new Point(patternSize) });
        for(let x = 0; x < num; x++)
        {
            for(let y = 0; y < num; y++)
            {
                const res = CONFIG.resLoader.getResource("misc");
                const pos = new Point(x,y).scaleFactor(distBetweenIcons);
                const frame = subType == Type.TREAT ? MISC.treats.frame : MISC.decorations.frame;
                const op = new LayoutOperation({
                    frame: frame,
                    translate: pos,
                    dims: new Point(iconSize),
                    pivot: new Point(0.5)
                })
                await res.toCanvas(ctx, op);
            }
        }

        const img = await convertCanvasToImage(ctx.canvas);
        const res = new ResourceImage(img);
        this.patterns[subType] = res;
    }
}