import CONFIG from "../js_shared/config";
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

    constructor(r:ResourceLoader, cardSize:Point, inkFriendly:boolean)
    {
        this.resLoader = r;
        this.inkFriendly = inkFriendly;
        this.size = cardSize;
        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = this.size.clone().scale(0.5);
        
        this.effects = [];
        if(inkFriendly) { this.effects.push(new GrayScaleEffect()); }
    }

    async prepare()
    {
    }
}