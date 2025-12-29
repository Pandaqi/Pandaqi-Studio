import { MaterialVisualizer, ResourceGroup, LayoutEffect, DropShadowEffect, GrayScaleEffect, LayoutOperation, Vector2, rangeInteger, TextConfig, Line, ResourceShape, Rectangle, ResourceText, StrokeAlign } from "lib/pq-games";
import { MISC, TILES, COLORS } from "../shared/dict";

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
    customData: Record<string,any>;

    constructor(keys:string|string[])
    {
        if(!Array.isArray(keys)) { keys = [keys]; }
        this.keys = keys;
        this.customData = {};
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.prepareDraw();

        if(this.isArrowTile()) {
            this.drawArrowTile(vis, group);
        } else {
            this.drawBackgroundTexture(vis, group);
            this.drawIcons(vis, group);
        }
        return await vis.finishDraw(group);
    }

    isArrowTile() { return this.keys.includes("arrow"); }
    drawArrowTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const effects : LayoutEffect[] = [new DropShadowEffect({ blurRadius: vis.get("tiles.icon.dropShadowBlur") })];
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }

        const res = vis.getResource("misc");
        const resOp = new LayoutOperation({
            pos: vis.center,
            frame: MISC.arrow.frame,
            size: vis.get("tiles.icon.size"),
            pivot: Vector2.CENTER,
            effects: effects
        })
        group.add(res, resOp);
    }

    drawBackgroundTexture(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly) { return; }

        const res = vis.getResource("misc");
        const randBG = rangeInteger(1, vis.get("tiles.generation.numBackgrounds"));
        const frame = MISC["bg_" + randBG].frame;
        const resOp = new LayoutOperation({
            size: vis.size,
            frame: frame,
            alpha: vis.get("tiles.background.textureAlpha")
        })

        group.add(res, resOp);
    }

    drawIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const rectSize = vis.size.clone().scale(0.5);
        const rectPositions = 
        [
            new Vector2(),
            new Vector2(rectSize.x, 0),
            rectSize.clone(),
            new Vector2(0, rectSize.y)
        ];

        let rectCounter = 0;
        let numRects = NUM_RECTS_PER_KEY[this.keys.length];

        const iconDims = vis.get("tiles.icon.size").clone();
        const res = vis.getResource("tiles");
        const isMultiIcon = this.keys.length > 1;
        if(isMultiIcon) { iconDims.scale(0.5); }

        const effects : LayoutEffect[] = [new DropShadowEffect({ blurRadius: vis.get("tiles.icon.dropShadowBlur") })];
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }

        const glowEffect = [new DropShadowEffect({ color: "#FFFFFF", blurRadius: vis.get("tiles.gemstones.glowBlur") })];
        let fontSize = vis.get("tiles.gemstones.fontSize");
        if(isMultiIcon) { fontSize *= 0.5; }

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize
        }).alignCenter();

        const DIVIDING_LINES = 
        [
            new Line(new Vector2(), new Vector2(0,-rectSize.y)),
            new Line(new Vector2(), new Vector2(rectSize.x, 0)),
            new Line(new Vector2(), new Vector2(0, rectSize.y)),
            new Line(new Vector2(), new Vector2(-rectSize.x, 0))
        ]

        const dividingLineResources = [];
        for(const key of this.keys)
        {
            const tileData = TILES[key];
            const color = vis.inkFriendly ? "#FFFFFF" : COLORS[tileData.color ?? "white"];
            const rectOp = new LayoutOperation({
                fill: color,
                alpha: vis.get("tiles.background.colorAlpha")
            });

            // special case; with 3 keys, the last one takes double space to get 1 + 1 + 2 = 4
            if(this.keys.length == 3 && rectCounter == 2) { numRects = 2; } 

            // color in the sections
            const midPoint = new Vector2();
            let rot = 0; // we rotate the icons so the tile looks completely normal in _diamond_ orientation
            for(let i = 0; i < numRects; i++)
            {
                const anchorPos = rectPositions[rectCounter];
                const rect = new ResourceShape(new Rectangle().fromTopLeft(anchorPos, rectSize));
                group.add(rect, rectOp);
                rectCounter++;
                midPoint.add( anchorPos.clone().add(rectSize.clone().scale(0.5)) );
                rot += rectCounter * 0.5 * Math.PI - 0.25*Math.PI;
            }
            midPoint.scale(1.0 / numRects);
            rot /= numRects;

            // then add the icon at the midpoint of those sections
            const resOp = new LayoutOperation({
                pos: midPoint,
                size: iconDims,
                rot: rot,
                frame: tileData.frame,
                pivot: Vector2.CENTER,
                effects: effects
            })
            group.add(res, resOp);

            // if it's a gemstone, add point total
            if(tileData.gem)
            {
                const text = tileData.points == 0 ? "?" : tileData.points.toString();
                const resText = new ResourceText({ text: text, textConfig: textConfig });
                const textOp = new LayoutOperation({
                    pos: midPoint,
                    size: iconDims,
                    pivot: Vector2.CENTER,
                    rot: rot,
                    fill: vis.get("tiles.gemstones.textFillColor"),
                    stroke: vis.get("tiles.gemstones.textStrokeColor"),
                    strokeWidth: vis.get("tiles.gemstones.strokeWidth"),
                    strokeAlign: StrokeAlign.OUTSIDE,
                    effects: glowEffect
                })
                group.add(resText, textOp);
            }

            if(isMultiIcon)
            {
                // add dividing line at last rect edge (if multiple sections)
                dividingLineResources.push(new ResourceShape(DIVIDING_LINES[(rectCounter + 4 - 1) % 4]));
            }
        }

        // draw all dividing lines we assembled
        const lineOp = new LayoutOperation({
            pos: vis.center,
            stroke: vis.get("tiles.background.stroke"),
            strokeWidth: vis.get("tiles.background.strokeWidth"),
        })
        for(const lineRes of dividingLineResources)
        {
            group.add(lineRes, lineOp)
        }
    }
}