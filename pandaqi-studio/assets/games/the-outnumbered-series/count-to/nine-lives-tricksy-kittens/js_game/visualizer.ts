import CONFIG from "../js_shared/config";
import { MISC } from "../js_shared/dict";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import patternizeGrid from "js/pq_games/layout/patterns/patternizeGrid";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import Point from "js/pq_games/tools/geometry/point";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";

export default class Visualizer
{
    patternCat: ResourceImage
    patternHeart: ResourceImage
    patternHeartOutline: ResourceImage
    resLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    center: Point;
    inkFriendly: boolean;
    effects: LayoutEffect[];

    constructor(r:ResourceLoader, itemSize:Point, inkFriendly:boolean)
    {
        this.resLoader = r;
        this.inkFriendly = inkFriendly;
        this.size = itemSize;
        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = this.size.clone().scale(0.5);

        this.effects = [];

        const shadowColor = CONFIG.cards.shared.shadowColor;
        const shadowOffset = new Point(CONFIG.cards.shared.shadowOffset * this.sizeUnit);
        this.effects.push(new DropShadowEffect({ color: shadowColor, offset: shadowOffset }));
        if(inkFriendly) { this.effects.push(new GrayScaleEffect()); }
    }

    async prepare()
    {
        await this.createPatterns();
    }

    async createPatterns()
    {
        const params = {
            size: (1.0 + CONFIG.cards.bgCats.patternExtraMargin) * this.size.y,
            sizeIcon: CONFIG.cards.bgCats.patternIconSize,
            num: CONFIG.cards.bgCats.patternNumIcons,
            resource: this.resLoader.getResource("misc"),
            frame: MISC.bg_cat_outline.frame
        }

        this.patternCat = await patternizeGrid(params);
    }
}