import Point from "js/pq_games/tools/geometry/point";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import { CONFIG } from "../shared/config";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";

export default class Visualizer
{
    resourceLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    center: Point;
    effects: LayoutEffect[];
    inkFriendly: boolean;

    constructor(r:ResourceLoader, itemSize:Point, inkFriendly:boolean)
    {
        this.resourceLoader = r;
        this.size = itemSize;
        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = this.size.clone().scale(0.5);
        this.inkFriendly = inkFriendly;

        const glowRadius = CONFIG.tiles.shared.glowRadius * this.sizeUnit;
        const glowColor = CONFIG.tiles.shared.glowColor;
        this.effects = [
            new DropShadowEffect({ blurRadius: glowRadius, color: glowColor })
        ]

        if(this.inkFriendly) { this.effects.push(new GrayScaleEffect()); }
    }
}