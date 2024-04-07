import Point from "js/pq_games/tools/geometry/point";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import CONFIG from "../js_shared/config";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import Path from "js/pq_games/tools/geometry/paths/path";

export default class Visualizer
{
    resLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    center: Point;
    effects: LayoutEffect[];
    effectsGrayscaleOnly: LayoutEffect[];
    inkFriendly: boolean;

    constructor(params)
    {
        this.resLoader = params.resLoader ?? new ResourceLoader();
        this.size = params.itemSize;
        this.sizeUnit = this.size.smallestSide();
        this.center = this.size.clone().scale(0.5);
        this.inkFriendly = params.inkFriendly ?? false;

        // @TODO
        const glowRadius = CONFIG.cards.shared.glowRadius * this.sizeUnit;
        const glowColor = CONFIG.cards.shared.glowColor;
        this.effects = [
            new DropShadowEffect({ blurRadius: glowRadius, color: glowColor })
        ]

        const grayscale = new GrayScaleEffect();
        if(this.inkFriendly) { this.effects.push(grayscale); }
        this.effectsGrayscaleOnly = [grayscale];
    }

    getPointyRect(anchor:Point, dims:Point, offset = 0.9)
    {
        const points = [
            new Point(anchor.x - 0.5*dims.x, anchor.y),
            new Point(anchor.x - 0.5*offset*dims.x, anchor.y - 0.5*dims.y),
            new Point(anchor.x + 0.5*offset*dims.x, anchor.y - 0.5*dims.y),
            new Point(anchor.x + 0.5*dims.x, anchor.y),
            new Point(anchor.x + 0.5*offset*dims.x, anchor.y + 0.5*dims.y),
            new Point(anchor.x - 0.5*offset*dims.x, anchor.y + 0.5*dims.y)
        ]
        return new Path({ points: points });
    }
}