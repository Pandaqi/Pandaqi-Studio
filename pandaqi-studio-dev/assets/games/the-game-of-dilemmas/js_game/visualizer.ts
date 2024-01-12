import Point from "js/pq_games/tools/geometry/point";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";

export default class Visualizer
{
    resLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    center: Point;
    inkFriendly: boolean;

    constructor(params)
    {
        this.resLoader = params.resLoader ?? new ResourceLoader();
        this.size = params.itemSize;
        this.sizeUnit = this.size.smallestSide();
        this.center = this.size.clone().scale(0.5);
        this.inkFriendly = params.inkFriendly ?? false;
    }
}