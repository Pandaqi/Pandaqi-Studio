import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { MISC, TILES } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import TextConfig from "js/pq_games/layout/text/textConfig";

const NUM_RECTS_PER_KEY =
{
    1: 4,
    2: 2,
    3: 1,
    4: 1
}

export default class Tile
{
    keys:string[]

    constructor(keys:string|string[])
    {
        if(!Array.isArray(keys)) { keys = [keys]; }
        this.keys = keys;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        if(this.isArrowTile()) {
            this.drawArrowTile(vis, group);
        } else {
            this.drawIcons(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    isArrowTile() { return this.keys.includes("arrow"); }
    drawArrowTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("misc");
        const resOp = new LayoutOperation({
            translate: vis.center,
            frame: MISC.arrow.frame,
            dims: vis.get("cards.icon.dims"),
            pivot: Point.CENTER
        })
        group.add(res, resOp);
    }

    drawIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const rectSize = vis.size.clone().scale(0.5);
        const rectPositions = 
        [
            new Point(),
            new Point(rectSize.x, 0),
            rectSize.clone(),
            new Point(0, rectSize.y)
        ];

        let rectCounter = 0;
        let numRects = NUM_RECTS_PER_KEY[this.keys.length];

        const iconDims = vis.get("cards.icon.dims").clone();
        const res = vis.getResource("tiles");
        if(this.keys.length > 1) { iconDims.scale(0.5); }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.gemstones.fontSize")
        }).alignCenter();

        for(const key of this.keys)
        {
            const tileData = TILES[key];
            const color = tileData.color ?? "#FFFFFF";
            const rectOp = new LayoutOperation({
                fill: color
            });

            // special case; with 3 keys, the last one takes double space to get 1 + 1 + 2 = 4
            if(this.keys.length == 3 && rectCounter == 2) { numRects = 2; } 

            // color in the sections
            const midPoint = new Point();
            let rotation = 0; // we rotate the icons so the tile looks completely normal in _diamond_ orientation
            for(let i = 0; i < numRects; i++)
            {
                const anchorPos = rectPositions[rectCounter];
                const rect = new ResourceShape(new Rectangle().fromTopLeft(anchorPos, rectSize));
                group.add(rect, rectOp);
                rectCounter++;
                midPoint.add( anchorPos.clone().add(rectSize.clone().scale(0.5)) );
                rotation += rectCounter * 0.5 * Math.PI - 0.25*Math.PI;
            }
            midPoint.scale(1.0 / numRects);
            rotation /= numRects;

            // then add the icon at the midpoint of those sections
            const resOp = new LayoutOperation({
                translate: midPoint,
                dims: iconDims,
                rotation: rotation,
                frame: tileData.frame,
                pivot: Point.CENTER
            })
            group.add(res, resOp);

            // if it's a gemstone, add point total
            if(tileData.gem)
            {
                const text = tileData.points == 0 ? "?" : tileData.points.toString();
                const resText = new ResourceText({ text: text, textConfig: textConfig });
                const textOp = new LayoutOperation({
                    translate: midPoint,
                    dims: iconDims,
                    pivot: Point.CENTER,
                    rotation: rotation,
                    fill: vis.get("cards.gemstones.textFillColor"),
                    stroke: vis.get("cards.gemstones.textStrokeColor"),
                    strokeWidth: vis.get("cards.gemstones.strokeWidth"),
                    strokeAlign: StrokeAlign.OUTSIDE
                })
                group.add(resText, textOp);
            }

        }
    }
}