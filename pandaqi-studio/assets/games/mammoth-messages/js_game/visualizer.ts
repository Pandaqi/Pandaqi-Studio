import Point from "js/pq_games/tools/geometry/point";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import LayoutEffect from "js/pq_games/layout/effects/layoutEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import { COLORS, MISC } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import createContext from "js/pq_games/layout/canvas/createContext";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";

export default class Visualizer
{
    resLoader: ResourceLoader;
    size: Point;
    sizeUnit: number;
    center: Point;
    inkFriendly: boolean;
    effects: LayoutEffect[];
    dropShadowEffects: LayoutEffect[];
    tintedSquareResource: ResourceImage;

    constructor(params)
    {
        this.resLoader = params.resLoader ?? new ResourceLoader();
        this.size = params.itemSize;
        this.sizeUnit = this.size.smallestSide();
        this.center = this.size.clone().scale(0.5);
        this.inkFriendly = params.inkFriendly ?? false;
        this.tintedSquareResource = null;

        this.effects = [];
        if(this.inkFriendly) { this.effects.push(new GrayScaleEffect()); }

        const shadowOffset = new Point(0, 0.015).scale(this.sizeUnit);
        this.dropShadowEffects = this.effects.slice();
        this.dropShadowEffects.push(new DropShadowEffect({ offset: shadowOffset, color: "#00000077" }))
    }

    async cacheTintedSquares()
    {
        if(this.tintedSquareResource) { return; }

        const res = new ResourceImage();

        const resMisc = this.resLoader.getResource("misc") as ResourceImage;
        const resIcon = this.resLoader.getResource("colors") as ResourceImage;
        const newCanvases = [];

        // for each color ...
        for(const [colorKey,colorData] of Object.entries(COLORS))
        {
            // create a tinted clay background
            const img1 = resMisc.getImageFrameAsResource(MISC.clay_square.frame);
            const ctx = createContext({ size: img1.size });
            const op1 = new LayoutOperation({
                effects: [new TintEffect(colorData.color)]
            })
            await img1.toCanvas(ctx, op1);

            // place the corresponding pattern centered on it (slightly scaled down to push off edges)
            const center = img1.size.clone().scale(0.5);
            const img2 = resIcon.getImageFrameAsResource(colorData.frame);
            const op2 = new LayoutOperation({
                pos: center,
                size: img1.size.clone().scale(0.85),
                pivot: Point.CENTER
            })

            // save resulting canvas
            const canv = await img2.toCanvas(ctx, op2);
            newCanvases.push(canv);
        }

        // save these new frames on the resource
        const newFrames = await convertCanvasToImageMultiple(newCanvases, true);
        await res.addFrames(newFrames);

        this.tintedSquareResource = res;
    }
}