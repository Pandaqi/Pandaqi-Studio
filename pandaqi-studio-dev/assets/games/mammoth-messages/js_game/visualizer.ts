import Point from "js/pq_games/tools/geometry/point";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Visualizer
{
    resLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    center: Point;
    inkFriendly: boolean;
    effects: LayoutEffect[];
    dropShadowEffects: LayoutEffect[];

    constructor(params)
    {
        this.resLoader = params.resLoader ?? new ResourceLoader();
        this.size = params.itemSize;
        this.sizeUnit = this.size.smallestSide();
        this.center = this.size.clone().scale(0.5);
        this.inkFriendly = params.inkFriendly ?? false;

        this.effects = [];
        if(this.inkFriendly) { this.effects.push(new GrayScaleEffect()); }

        const shadowOffset = new Point(0, 0.015).scale(this.sizeUnit);
        this.dropShadowEffects = this.effects.slice();
        this.dropShadowEffects.push(new DropShadowEffect({ offset: shadowOffset, color: "#00000077" }))
    }
}