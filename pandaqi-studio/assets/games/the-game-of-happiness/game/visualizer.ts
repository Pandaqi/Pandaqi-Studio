import Point from "js/pq_games/tools/geometry/point";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import CONFIG from "../shared/config";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import Path from "js/pq_games/tools/geometry/paths/path";

export default class Visualizer
{
    resLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    center: Point;
    inkFriendly: boolean;
    effects: LayoutEffect[];

    constructor(params)
    {
        this.resLoader = params.resLoader ?? new ResourceLoader();
        this.size = params.itemSize;
        this.sizeUnit = this.size.smallestSide();
        this.center = this.size.clone().scale(0.5);
        this.inkFriendly = params.inkFriendly ?? false;

        this.effects = [];
        if(this.inkFriendly) { this.effects.push(new GrayScaleEffect()); }
    }
}