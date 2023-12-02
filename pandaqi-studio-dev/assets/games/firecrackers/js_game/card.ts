import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import { ACTIONS, CardType, MISC, PACKS } from "../js_shared/dict";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlignValue from "js/pq_games/layout/values/strokeAlignValue";
import ColorLike from "js/pq_games/layout/color/colorLike";
import fromArray from "js/pq_games/tools/random/fromArray";
import Star from "js/pq_games/tools/geometry/star";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";

export default class Card
{
    type: CardType;
    num: number;
    action: string;

    constructor(type:CardType, num:number, action: string)
    {
        this.type = type;
        this.num = num;
        this.action = action;
    }

    async drawForRules(cfg)
    {
        // @TODO
    }

    getTypeData() { return PACKS[this.type]; }
    getActionData() { return ACTIONS[this.action]; }
    hasAction() { return this.action != null; }
    getPurchaseCost()
    {
        const numCost = CONFIG.generation.coinsPerNumber[this.num] ?? 0;
        const actionCost = this.hasAction() ? ACTIONS[this.action] : CONFIG.generation.defCoinsPerAction; 
        return numCost + actionCost;
    }

    toString()
    {
        return this.type + " " + this.num;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        await this.drawBackground(vis, ctx);
        await this.drawCorners(vis, ctx);
        await this.drawMainIllustration(vis, ctx);
        await this.drawAction(vis, ctx);
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    async drawBackground(vis:Visualizer, ctx)
    {
        const colorDark = this.getTypeData().colorDark;
        fillCanvas(ctx, colorDark);
    }

    async drawCorners(vis, ctx)
    {
        const typeData = this.getTypeData();
        const isAction = this.hasAction();

        const offsetBig = CONFIG.cards.corners.edgeOffsetBig.clone().scale(vis.sizeUnit);
        const offsetSmall = CONFIG.cards.corners.edgeOffsetSmall.clone().scale(vis.sizeUnit);
        const positionsBig = getRectangleCornersWithOffset(vis.size, offsetBig);
        const positionsSmall = getRectangleCornersWithOffset(vis.size, offsetSmall)

        const dimsBig = new Point(CONFIG.cards.corners.starScaleBig * vis.sizeUnit);
        const dimsSmall = new Point(CONFIG.cards.corners.starScaleSmall * vis.sizeUnit);

        const fontSizeBig = CONFIG.cards.corners.fontSizeBig * vis.sizeUnit;
        const fontSizeSmall = CONFIG.cards.corners.fontSizeSmall * vis.sizeUnit;

        const text = this.num.toString();
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const fillColor = vis.inkFriendly ? "#111111" : typeData.colorDark;
        const strokeColor = vis.inkFriendly ? "#FFFFFF" : typeData.colorLight;

        for(let i = 0; i < positionsBig.length; i++)
        {
            const isBig = i <= 1 || !isAction;

            const rot = (i <= 1 || !isAction) ? 0 : Math.PI;
            const pos = isBig ? positionsBig[i] : positionsSmall[i];
            const dims = isBig ? dimsBig : dimsSmall;
            const fontSize = isBig ? fontSizeBig : fontSizeSmall;

            const starShape = new Star({ radiusOutside: dims.x, radiusInside: 0.66*dims.x });
            const resStar = new ResourceShape(starShape);
            const starColor = isBig ? strokeColor : fillColor; // @TODO: probably some in-between color?

            const op = new LayoutOperation({
                translate: pos,
                dims: dims,
                pivot: Point.CENTER,
                fill: starColor,
                rotation: rot,
                effects: vis.effects
            })
            await resStar.toCanvas(ctx, op);

            const strokeWidth = CONFIG.cards.corners.strokeWidth * fontSize;
            const tempTextConfig = textConfig.clone();
            tempTextConfig.size = fontSize;
            const resText = new ResourceText({ text: text, textConfig: tempTextConfig });

            op.fill = new ColorLike(fillColor);
            op.stroke = new ColorLike(strokeColor);
            op.strokeWidth = strokeWidth;
            op.strokeAlign = StrokeAlignValue.OUTSIDE
            op.effects = vis.effects; // @TODO: not sure if it should copy the regular effects for this text
            await resText.toCanvas(ctx, op);

        }
    }

    async drawMainIllustration(vis:Visualizer, ctx)
    {
        const pos = new Point(vis.center, CONFIG.cards.illustration.yPos * vis.size.y);
        const dims = new Point(CONFIG.cards.illustration.scale * vis.sizeUnit);
        let frame = this.getTypeData().frame;
        if(this.type == CardType.BLACK) { frame = fromArray(CONFIG.cards.illustration.blackFrames); }

        // bg faded
        const resBG = vis.resourceLoader.getResource("types_bg");
        const alphaBG = CONFIG.cards.illustration.bgAlpha;
        const composite = CONFIG.cards.illustration.bgComposite;
        const opBG = new LayoutOperation({
            frame: frame,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER,
            alpha: alphaBG,
            // @ts-ignore
            composite: composite
        })
        await resBG.toCanvas(ctx, opBG);

        // actual front picture
        const res = vis.resourceLoader.getResource("types");
        const op = new LayoutOperation({
            frame: frame,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER
        })
        await res.toCanvas(ctx, op);
    }

    async drawAction(vis:Visualizer, ctx)
    {
        if(!this.hasAction()) { return; }

        const typeData = this.getTypeData();

        // @TODO: draw background rectangles and stuff, however needed
        // @TODO: draw card cost in coins

        // first the action title
        const actionData = this.getActionData();
        const title = actionData.label;
        const titlePos = new Point(vis.center.x, CONFIG.cards.title.yPos);
        const titleFontSize = CONFIG.cards.title.fontSize * vis.sizeUnit;
        const titleDims = new Point(vis.size.x, 2*titleFontSize);

        const titleTextConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: titleFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const resTextTitle = new ResourceText({ text: title, textConfig: titleTextConfig });
        const opTitle = new LayoutOperation({
            translate: titlePos,
            fill: typeData.colorLight,
            dims: titleDims,
            pivot: Point.CENTER
        })

        await resTextTitle.toCanvas(ctx, opTitle);

        // then the actual action text
        const text = actionData.desc;
        const textPos = new Point(vis.center.x, CONFIG.cards.action.yPos);
        const textFontSize = CONFIG.cards.action.fontSize * vis.sizeUnit;
        const textDims = CONFIG.cards.action.textDims.clone().scale(vis.size);
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: textFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: textPos,
            fill: typeData.colorDark,
            dims: textDims,
            pivot: Point.CENTER
        })

        await resText.toCanvas(ctx, opText);
    }


    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}