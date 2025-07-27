import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../shared/config";

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

        const shadowRadius = CONFIG.cards.shared.shadowRadius * this.sizeUnit;
        const shadowColor = CONFIG.cards.shared.shadowColor;
        const shadowEffect = new DropShadowEffect({ blurRadius: shadowRadius, color: shadowColor });

        this.effects.push(shadowEffect);
        if(inkFriendly) { this.effects.push(new GrayScaleEffect()); }
    }

    async prepare()
    {
    }
}