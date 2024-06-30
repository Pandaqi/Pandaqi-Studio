import Color from "js/pq_games/layout/color/color";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import CONFIG from "../js_shared/config";
import { COASTER_PARTS, ITEMS, ItemType, MISC, PATHS, PATHS_ORDER, PathType } from "../js_shared/dict";

export default class DominoSide
{
    type:ItemType;
    typePath:PathType;
    key:string;
    keyPath:string;
    rotation:number; // integer; 0-4; 0 = right, 1 = down, 2 = left, 3 = up

    constructor(it:ItemType)
    {
        this.type = it;
        this.rotation = Math.floor(Math.random() * 4);
    }

    getTypeData()
    {
        return ITEMS[this.type][this.key] ?? {};
    }

    setKey(k:string)
    {
        this.key = k;
    }

    getPathData()
    {
        return this.isCoaster() ? COASTER_PARTS[this.keyPath] : PATHS[this.keyPath];
    }

    isOpenAt(rot:number)
    {
        if(this.isCompletelyClosed()) { return false; }
        if(this.isCompletelyOpen()) { return true; }

        const pathData = this.getPathData();
        if(!pathData) { return false; }

        const sides = pathData.sides;
        const rotOffset = ((rot - this.rotation) + 4) % 4;
        return sides[rotOffset];
    }

    isCompletelyOpen()
    {
        const pathData = this.getPathData();
        if(!pathData)
        {
            if(this.type == ItemType.ATTRACTION) { return true; }
            return false;
        }
        return pathData.sides.filter((x) => x == true).length >= 4;
    }

    isCompletelyClosed()
    {
        return this.type == ItemType.STALL || this.type == ItemType.DECORATION;
    }

    rotate(dr = 1)
    {
        this.rotation = (this.rotation + dr + 4) % 4;
    }

    rotateUntilOpenAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(this.isOpenAt(rot)) { break; }
            this.rotate();
        }
    }

    rotateUntilClosedAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(!this.isOpenAt(rot)) { break; }
            this.rotate();
        }
    }

    hasPath()
    {
        return this.typePath != undefined;
    }

    setPathKey(k:string)
    {
        this.keyPath = k;
    }

    setPathType(t:PathType)
    {
        this.typePath = t;
    }

    isCoaster()
    {
        return this.typePath == PathType.COASTER;
    }

    isQueue()
    {
        return this.typePath == PathType.QUEUE1 || this.typePath == PathType.QUEUE2;
    }

    hasMainElement()
    {
        return this.key != undefined;
    }

    isScorableItem()
    {
        return this.type == ItemType.ATTRACTION || this.type == ItemType.STALL;
    }

    needsTunnel()
    {
        return this.keyPath == "deadend";
    }

    draw(vis:MaterialVisualizer) : ResourceGroup
    {
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawPath(vis, group);
        this.drawMain(vis, group);
        this.drawOverlay(vis, group);

        return group;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // a slightly randomized (off-green) background color
        // @NOTE: this domino is drawn around its CENTER, so we need a custom rectangle centered on (0,0) to fill the background exactly
        const baseColor : Color = vis.get("dominoes.bg.baseColor").clone();
        const bgColor = baseColor.randomizeAll(vis.get("dominoes.bg.randomizationBounds"));

        const partSize = new Point(vis.size.x, 0.5*vis.size.y);
        const rect = new ResourceShape(new Rectangle({ extents: partSize }));
        const rectOp = new LayoutOperation({ fill: bgColor });
        group.add(rect, rectOp);

        // the dotted texture
        const resMisc = vis.getResource("misc");
        const opDotTexture = new LayoutOperation({
            frame: MISC.bg_dot_texture.frame,
            dims: partSize,
            pivot: Point.CENTER,
            alpha: vis.get("dominoes.bg.dotTextureAlpha"),
            composite: vis.get("dominoes.bg.dotTextureComposite"),
            rotation: Math.floor(Math.random() * 4) * 0.5 * Math.PI
        })
        group.add(resMisc, opDotTexture);

        // the gradient (darker at sides; main element highlighted at center)
        const opGradient = new LayoutOperation({
            frame: MISC.bg_gradient.frame,
            dims: partSize,
            pivot: Point.CENTER,
            alpha: vis.get("dominoes.bg.gradientAlpha"),
            composite: vis.get("dominoes.bg.gradientComposite"),
            rotation: Math.floor(Math.random() * 4) * 0.5 * Math.PI
        })
        group.add(resMisc, opGradient);
    }

    drawPath(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasPath()) { return; }

        // the actual path (regular, queue, or coaster part)
        let frame = -1;
        if(this.typePath == PathType.COASTER) {
            frame = COASTER_PARTS[this.keyPath].frame;
        } else {
            const frameBase = PATHS_ORDER.indexOf(this.typePath);
            const numPathVariations = Object.keys(PATHS).length;
            const frameOffset = PATHS[this.keyPath].frame;
            frame = frameBase * numPathVariations + frameOffset;
        }

        const rotation = this.rotation * 0.5 * Math.PI;

        const res = vis.getResource("paths");
        const op = new LayoutOperation({
            frame: frame,
            dims: new Point(vis.sizeUnit),
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect,
            rotation: rotation
        });
        group.add(res, op);

        // the tunnel
        if(this.needsTunnel())
        {
            const resTunnel = vis.getResource("misc");
            const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.025*vis.sizeUnit })
            const rotation = (this.rotation - 1) * 0.5 * Math.PI;
            const opTunnel = new LayoutOperation({
                frame: MISC.tunnel.frame,
                dims: vis.get("dominoes.paths.tunnelDims"),
                effects: [glowEffect, vis.inkFriendlyEffect].flat(),
                pivot: Point.CENTER,
                rotation: rotation
            });
            group.add(resTunnel, opTunnel);
        }
    }

    drawMain(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasMainElement()) { return; }

        // @TODO: a cleaner DRY way for this
        let resourceKey = "";
        if(this.type == ItemType.ATTRACTION) { resourceKey = "attractions"; }
        else if(this.type == ItemType.DECORATION) { resourceKey = "decorations"; }
        else if(this.type == ItemType.STALL) { resourceKey = "stalls"; }

        const data = this.getTypeData();
        const res = vis.getResource(resourceKey);
        const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.025*vis.sizeUnit })
        const op = new LayoutOperation({
            frame: data.frame,
            dims: vis.get("dominoes.main.dims"),
            effects: [glowEffect, vis.inkFriendlyEffect].flat(),
            pivot: Point.CENTER
        });
        group.add(res, op);
    }

    drawOverlay(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getTypeData();
        const partHeight = 0.5*vis.size.y;

        // @TODO: draw some indication of the item TYPE? (Stall/Decoration/Attraction) That seems most useful in practice
        
        // score value/factor
        if(this.isScorableItem())
        {
            // the background star/icon
            const res = vis.getResource("misc");
            const starDims = vis.get("dominoes.score.dims");
            const op = new LayoutOperation({
                translate: new Point(-0.5*vis.size.x, -0.5*partHeight).add(starDims.clone().scale(0.66)),
                frame: MISC.score_star.frame,
                dims: starDims,
                pivot: Point.CENTER
            });
            group.add(res, op);

            // the actual text with the value
            let text = data.value.toString();
            if(data.dynamic) { text = "#" };
            if(data.valueDisplay) { text = data.valueDisplay.toString(); }

            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("dominoes.score.fontSize"),
            }).alignCenter();
    
            const resText = new ResourceText({ text, textConfig });
            const opText = new LayoutOperation({
                translate: op.translate.clone(), 
                pivot: Point.CENTER,
                fill: vis.get("dominoes.score.textColor"),
                stroke: vis.get("dominoes.score.strokeColor"),
                strokeWidth: vis.get("dominoes.score.strokeWidth"),
                strokeAlign: StrokeAlign.OUTSIDE,
                dims: new Point(2*textConfig.size),
            });
            group.add(resText, opText);
        }

        // extra explanatory text when needed
        if(data.desc && CONFIG.addText)
        {
            const textPos = new Point(0, 0.33*partHeight);
            const textDims = new Point(0.9*vis.size.x, 0.275*partHeight);
            const rectParams = { pos: textPos, dims: textDims, color: "#111111", alpha: 0.75 };
            drawBlurryRectangle(rectParams, group);
    
            const text = data.desc;
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("dominoes.text.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
    
            const resText = new ResourceText({ text, textConfig });
            const opText = new LayoutOperation({
                translate: textPos, 
                pivot: Point.CENTER,
                fill: "#FFEEEE",
                dims: new Point(0.9*textDims.x, textDims.y)
            });
            group.add(resText, opText);
        }
 
    }
}