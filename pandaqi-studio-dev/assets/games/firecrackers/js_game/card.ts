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
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import Path from "js/pq_games/tools/geometry/paths/path";
import Color from "js/pq_games/layout/color/color";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

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
        const actionCost = this.hasAction() ? (ACTIONS[this.action].cost ?? CONFIG.generation.defCoinsPerAction) : 0; 
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
        await this.drawMainIllustration(vis, ctx);
        await this.drawAction(vis, ctx);
        await this.drawCost(vis, ctx);
        await this.drawCorners(vis, ctx);
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    async drawBackground(vis:Visualizer, ctx)
    {
        let colorDark = this.getTypeData().colorDark;
        if(vis.inkFriendly)
        {
            colorDark = (this.type == CardType.BLACK) ? "#CCCCCC" : CONFIG.cards.shared.colorDarkInkFriendly;
        }

        fillCanvas(ctx, colorDark);
    }

    async drawCost(vis:Visualizer, ctx)
    {
        // draw rectangle behind it
        const yPos = CONFIG.cards.coins.yPos;
        const anchorPos = new Point(vis.center.x, yPos * vis.size.y);
        const rectDimsRaw = this.hasAction() ? CONFIG.cards.coins.rectDimsAction : CONFIG.cards.coins.rectDims;
        const rectDims = rectDimsRaw.clone().scale(vis.size);
        const pointyOffset = this.hasAction() ? CONFIG.cards.coins.rectDimsOffsetAction : CONFIG.cards.coins.rectDimsOffset;
        const pointyRect = vis.getPointyRect(anchorPos, rectDims, pointyOffset);
        const typeData = this.getTypeData();
        const color = vis.inkFriendly ? CONFIG.cards.shared.colorMidInkFriendly : typeData.colorMid;

        const rectOp = new LayoutOperation({
            fill: color
        });
        await new ResourceShape(pointyRect).toCanvas(ctx, rectOp);

        // draw actual coins
        const cost = this.getPurchaseCost();
        const coinDims = new Point(CONFIG.cards.coins.scale * vis.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: anchorPos, num: cost, dims: coinDims, dir: Point.RIGHT });
        const coinDimsDisplayed = coinDims.clone().scale(CONFIG.cards.coins.displayDownScale);

        const shadowEffect = new DropShadowEffect({ 
            blurRadius: CONFIG.cards.coins.shadowBlur * vis.sizeUnit,
            color: CONFIG.cards.coins.shadowColor,
            offset: CONFIG.cards.coins.shadowOffset.clone().scale(vis.sizeUnit)
        })

        const res = vis.resLoader.getResource("misc");
        const frame = MISC.coin.frame;
        const op = new LayoutOperation({
            dims: coinDimsDisplayed,
            frame: frame,
            pivot: Point.CENTER,
            effects: [shadowEffect]
        })

        for(const pos of positions)
        {
            op.translate = pos;
            await res.toCanvas(ctx, op);
        }
    }

    async drawCorners(vis, ctx)
    {
        const typeData = this.getTypeData();
        const isAction = this.hasAction();

        const offsetBig = CONFIG.cards.corners.edgeOffsetBig.clone().scale(vis.sizeUnit);
        const offsetSmall = CONFIG.cards.corners.edgeOffsetSmall.clone().scale(vis.sizeUnit);
        const positionsBig = getRectangleCornersWithOffset(vis.size, offsetBig);
        const positionsSmall = getRectangleCornersWithOffset(vis.size, offsetSmall)

        // @EXCEPTION: on action cards, we move the small numbers to the title pos, to make room for cost at bottom
        if(CONFIG.cards.corners.moveSmallStarsToTitle)
        {
            const titlePos = new Point(vis.center.x, CONFIG.cards.title.yPos * vis.size.y);
            for(const elem of positionsSmall)
            {
                elem.y = titlePos.y
            }
        }


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

        const colorDark = vis.inkFriendly ? CONFIG.cards.shared.colorDarkInkFriendly : typeData.colorDark;
        const colorMid = vis.inkFriendly ? CONFIG.cards.shared.colorMidInkFriendly : typeData.colorMid;
        const colorLight = vis.inkFriendly ? CONFIG.cards.shared.colorLightInkFriendly : typeData.colorLight;

        for(let i = 0; i < 4; i++)
        {
            const isTop = i <= 1;
            const isBig = isTop || !isAction;

            const rot = (i <= 1 || !isAction) ? 0 : Math.PI;
            const pos = isBig ? positionsBig[i] : positionsSmall[i];
            const dims = isBig ? dimsBig : dimsSmall;
            const fontSize = isBig ? fontSizeBig : fontSizeSmall;

            const starShape = new Star({ center: pos, radiusOutside: dims.x, radiusInside: 0.66*dims.x, rotation: rot - 0.5*Math.PI });
            const resStar = new ResourceShape(starShape);
            const starColor = isBig ? colorMid : colorDark; // @TODO: probably some in-between color?

            const op = new LayoutOperation({
                fill: starColor,
                effects: vis.effects
            })
            await resStar.toCanvas(ctx, op);

            const strokeWidth = CONFIG.cards.corners.strokeWidth * fontSize;
            const tempTextConfig = textConfig.clone();
            tempTextConfig.size = fontSize;
            const resText = new ResourceText({ text: text, textConfig: tempTextConfig });

            const textColor = isBig ? colorDark : colorLight;
            const textStrokeColor = isBig ? colorLight : colorMid;

            const opText = new LayoutOperation({
                translate: pos,
                dims: dims,
                pivot: Point.CENTER,
                fill: textColor,
                stroke: textStrokeColor,
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlignValue.OUTSIDE,
                effects: vis.effects // @TODO: not sure if it should copy the regular effects for this text
            })

            await resText.toCanvas(ctx, opText);

        }
    }

    async drawMainIllustration(vis:Visualizer, ctx)
    {
        const pos = new Point(vis.center.x, CONFIG.cards.illustration.yPos * vis.size.y);
        let dims = new Point(CONFIG.cards.illustration.scale * vis.sizeUnit);

        if(this.hasAction())
        {
            pos.y = CONFIG.cards.illustration.yPosAction * vis.size.y;
            dims = dims.clone().scale(CONFIG.cards.illustration.actionScaleDown);
        }

        let frame = this.getTypeData().frame;
        if(this.type == CardType.BLACK) { frame = fromArray(CONFIG.cards.illustration.blackFrames); }

        // bg faded
        const resBG = vis.resLoader.getResource("types_bg");
        const alphaBG = CONFIG.cards.illustration.bgAlpha;
        const composite = CONFIG.cards.illustration.bgComposite;
        const frameBG = rangeInteger(0,3);
        const dimsBG = dims.clone().scale(CONFIG.cards.illustration.bgScale);
        const opBG = new LayoutOperation({
            frame: frameBG,
            translate: pos,
            dims: dimsBG,
            pivot: Point.CENTER,
            alpha: alphaBG,
            // @ts-ignore
            composite: composite
        })
        await resBG.toCanvas(ctx, opBG);

        // actual front picture
        const res = vis.resLoader.getResource("types");
        const effects = vis.inkFriendly ? vis.effectsGrayscaleOnly : [];
        const op = new LayoutOperation({
            frame: frame,
            translate: pos,
            dims: dims,
            pivot: Point.CENTER,
            effects: effects,
        })
        await res.toCanvas(ctx, op);
    }

    async drawAction(vis:Visualizer, ctx)
    {
        if(!this.hasAction()) { return; }

        const typeData = this.getTypeData();
        
        const actionData = this.getActionData();
        const title = actionData.label;
        const titlePos = new Point(vis.center.x, CONFIG.cards.title.yPos * vis.size.y);
        const titleFontSize = CONFIG.cards.title.fontSize * vis.sizeUnit;
        const titleDims = new Point(vis.size.x, 2*titleFontSize);

        const colorMid = vis.inkFriendly ? CONFIG.cards.shared.colorMidInkFriendly : typeData.colorMid;
        const colorLight = vis.inkFriendly ? CONFIG.cards.shared.colorLightInkFriendly : typeData.colorLight;
        const colorDark = vis.inkFriendly ? CONFIG.cards.shared.colorDarkInkFriendly : typeData.colorDark;

        // the general rectangle behind everything (lines up with title precisely, which is why we calculate that first)
        const rect = new Rectangle().fromTopLeft(new Point(0, titlePos.y), new Point(vis.size.x, vis.size.y - titlePos.y));
        const opRect = new LayoutOperation({
            fill: colorMid
        })
        await new ResourceShape(rect).toCanvas(ctx, opRect);

        // the inner rectangle with padding at left/right edge, lighter bg for readability
        const coinPos = new Point(vis.center.x, CONFIG.cards.coins.yPos * vis.size.y);
        const innerHeight = coinPos.y - titlePos.y;
        const rectInner = new Rectangle().fromTopLeft(new Point(0, titlePos.y), new Point(vis.size.x, innerHeight));
        rectInner.extents.x *= CONFIG.cards.action.innerRectDownScale;
        opRect.fill = new ColorLike(colorLight);
        await new ResourceShape(rectInner).toCanvas(ctx, opRect);

        const titleTextConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: titleFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const resTextTitle = new ResourceText({ text: title, textConfig: titleTextConfig });
        const opTitle = new LayoutOperation({
            translate: titlePos,
            fill: colorLight,
            dims: titleDims,
            pivot: Point.CENTER,
            effects: vis.effects
        })

        // the action title + pointy rect behind it
        const titleRectDims = CONFIG.cards.title.rectDims.clone().scale(titleDims);
        const pointyRect = vis.getPointyRect(titlePos, titleRectDims);
        const pointyRectOp = new LayoutOperation({
            fill: colorDark
        })

        await new ResourceShape(pointyRect).toCanvas(ctx, pointyRectOp);
        await resTextTitle.toCanvas(ctx, opTitle);

        // then the actual action text
        const text = actionData.desc;
        const textPos = new Point(vis.center.x, CONFIG.cards.action.yPos * vis.size.y);
        const textFontSize = CONFIG.cards.action.fontSize * vis.sizeUnit;
        const textDims = CONFIG.cards.action.textDims.clone().scale(vis.size);
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: textFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            resLoader: vis.resLoader
        })
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            translate: textPos,
            fill: colorDark,
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