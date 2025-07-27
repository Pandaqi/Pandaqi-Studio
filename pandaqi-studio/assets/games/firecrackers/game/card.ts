import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import { ACTIONS, CardMainType, CardType, MISC, PACKS, SCORING_RULES } from "../shared/dict";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig, { TextAlign, TextWeight } from "js/pq_games/layout/text/textConfig";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
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
import clamp from "js/pq_games/tools/numbers/clamp";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";

export default class Card
{
    mainType: CardMainType;
    type: CardType;
    num: number;
    action: string; // optional, key (to action for play card, to score rule for score card)

    constructor(mainType: CardMainType, type:CardType, num:number, action: string)
    {
        this.mainType = mainType;
        this.type = type;
        this.num = num;
        this.action = action;
    }

    async drawForRules(cfg)
    {
        const typeData = this.getTypeData();

        // colored bg (to signal type)
        const ctx = createContext({ size: cfg.size });
        const textCol = typeData.colorDark;
        const bgCol = typeData.colorMid;
        const foreCol = typeData.colorLight;
        fillCanvas(ctx, bgCol);

        // huge number in center
        const textConfig = new TextConfig().alignCenter();
        textConfig.size = 0.5*cfg.size.x;
        textConfig.font = CONFIG.fonts.heading;

        const strokeWidth = 0.05*cfg.size.x;
        const textOp = new LayoutOperation({
            size: cfg.size,
            pos: cfg.size.clone().scale(0.5),
            pivot: Point.CENTER,
            fill: textCol,
            stroke: foreCol,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE
        })

        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        await resText.toCanvas(ctx, textOp);

        // black outline
        strokeCanvas(ctx, "#000000", strokeWidth);

        return ctx.canvas;
    }

    getTypeData() { return PACKS[this.type]; }
    getActionData() { return ACTIONS[this.action]; }
    hasAction() { return this.action != null; }
    getPurchaseCost()
    {
        const numCost = CONFIG.generation.coinsPerNumber[this.num] ?? 0;
        const actionCost = this.hasAction() ? (ACTIONS[this.action].cost ?? CONFIG.generation.defCoinsPerAction) : 0; 
        const val = numCost + actionCost;
        const valClamped = clamp(val, 1, 5);
        return valClamped;
    }

    toString()
    {
        return this.type + " " + this.num;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        if(this.mainType == CardMainType.PLAY) {
            this.drawBackground(vis, ctx);
            this.drawMainIllustration(vis, group);
            this.drawAction(vis, group);
            this.drawCost(vis, group);
            this.drawCorners(vis, group);
        } else if(this.mainType == CardMainType.SCORE) {
            this.drawBackgroundScore(vis, ctx);
            this.drawScoreRule(vis, group);
        }
        
        await group.toCanvas(ctx);
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    //
    // Scoreworks cards
    //
    drawBackgroundScore(vis:Visualizer, ctx)
    {
        fillCanvas(ctx, "#FFFFFF");
        // @TODO: some default image to surround the text and make it less plain?
    }

    drawScoreRule(vis:Visualizer, group)
    {
        const data = SCORING_RULES[this.action];
        const titleFontSize = CONFIG.cards.scoreRule.titleFontSize * vis.sizeUnit;
        const titleTextConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: titleFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const title = data.label;
        const resTextTitle = new ResourceText({ text: title, textConfig: titleTextConfig });

        const titlePos = new Point(vis.center.x, CONFIG.cards.scoreRule.yPosTitle * vis.size.y);
        const titleDims = new Point(vis.size.x, 2*titleFontSize);
        const opTitle = new LayoutOperation({
            pos: titlePos,
            fill: "#FEFEFE",
            size: titleDims,
            pivot: Point.CENTER,
        })

        // the action title + pointy rect behind it
        const titleRectDims = CONFIG.cards.title.rectDims.clone().scale(titleDims);
        const pointyRect = vis.getPointyRect(titlePos, titleRectDims);
        const pointyRectOp = new LayoutOperation({ fill: "#212121" })

        group.add(new ResourceShape(pointyRect), pointyRectOp);
        group.add(resTextTitle, opTitle);

        // the actual scoring rule
        const text = data.desc;
        const textPos = new Point(vis.center.x, CONFIG.cards.scoreRule.yPosRule * vis.size.y);
        const textFontSize = CONFIG.cards.scoreRule.ruleFontSize * vis.sizeUnit;
        const textDims = CONFIG.cards.scoreRule.textDims.clone().scale(vis.size);
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: textFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            resLoader: vis.resLoader
        })
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: textPos,
            fill: "#212121",
            size: textDims,
            pivot: Point.CENTER
        })

        group.add(resText, opText);
    }

    //
    // Play cards
    //
    drawBackground(vis:Visualizer, ctx)
    {
        let colorDark = this.getTypeData().colorDark;
        if(vis.inkFriendly)
        {
            colorDark = (this.type == CardType.BLACK) ? "#CCCCCC" : CONFIG.cards.shared.colorDarkInkFriendly;
        }

        fillCanvas(ctx, colorDark);
    }

    drawCost(vis:Visualizer, group)
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
        group.add(new ResourceShape(pointyRect), rectOp);

        // @DEBUGGING?
        // draw a reminder that the coins are the card's COST when buying, not its purchase value/worth
        const fontSize = CONFIG.cards.coins.fontSize * vis.sizeUnit;
        const anchorPosCost = new Point(anchorPos.x, anchorPos.y - 0.5*rectDims.y);
        const rectDimsCost = new Point(7*fontSize, 1.2*fontSize);
        const pointyRect2 = vis.getPointyRect(anchorPosCost, rectDimsCost);

        const rectOp2 = new LayoutOperation({
            fill: new Color(color).darken(CONFIG.cards.coins.textRectDarken),
        })
        group.add(new ResourceShape(pointyRect2), rectOp2);

        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            weight: TextWeight.BOLD
        })
        const resText = new ResourceText({ text: "Cost", textConfig: textConfig });
        const textOp = new LayoutOperation({
            pos: anchorPosCost,
            size: rectDims,
            fill: CONFIG.cards.coins.textColor,
            alpha: CONFIG.cards.coins.textAlpha,
            stroke: "#000000",
            strokeWidth: 0.075 * fontSize,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        })
        group.add(resText, textOp);

        // draw actual coins
        const cost = this.getPurchaseCost();
        const coinDims = new Point(CONFIG.cards.coins.scale * vis.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: anchorPos, num: cost, size: coinDims, dir: Point.RIGHT });
        const coinDimsDisplayed = coinDims.clone().scale(CONFIG.cards.coins.displayDownScale);

        const res = vis.resLoader.getResource("misc");
        const frame = MISC.coin.frame;
        const op = new LayoutOperation({
            size: coinDimsDisplayed,
            frame: frame,
            pivot: Point.CENTER,
        })

        for(const pos of positions)
        {
            op.pos = pos;
            group.add(res, op.clone());
        }
    }

    drawCorners(vis:Visualizer, group)
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

        const sizeBig = new Point(3 * CONFIG.cards.corners.starScaleBig * vis.sizeUnit);
        const sizeSmall = new Point(3 * CONFIG.cards.corners.starScaleSmall * vis.sizeUnit);

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
            const size = isBig ? sizeBig : sizeSmall;
            const fontSize = isBig ? fontSizeBig : fontSizeSmall;

            const starShape = new Star({ center: pos, radiusOutside: size.x, radiusInside: 0.66*size.x, rotation: rot - 0.5*Math.PI });
            const resStar = new ResourceShape(starShape);
            const starColor = isBig ? colorMid : colorDark; // @TODO: probably some in-between color?

            const op = new LayoutOperation({
                fill: starColor,
                effects: vis.effects
            })
            group.add(resStar, op);

            const strokeWidth = isBig ? CONFIG.cards.corners.strokeWidth * fontSize : 0;
            const tempTextConfig = textConfig.clone();
            tempTextConfig.size = fontSize;
            const resText = new ResourceText({ text: text, textConfig: tempTextConfig });

            const textColor = isBig ? colorDark : colorLight;
            const textStrokeColor = isBig ? colorLight : colorMid;

            // @EXCEPTION: as usual, the number 1 needs to be offset slightly to look centered
            let posOffset = (this.num == 1) ? new Point(-0.1*fontSize, 0) : new Point();
            const effects = isBig ? vis.effects : [];

            const opText = new LayoutOperation({
                pos: pos.clone().move(posOffset),
                size: size,
                pivot: Point.CENTER,
                fill: textColor,
                stroke: textStrokeColor,
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE,
                effects: effects // @TODO: not sure if it should copy the regular effects for this text
            })

            group.add(resText, opText);
        }
    }

    drawMainIllustration(vis:Visualizer, group)
    {
        const pos = new Point(vis.center.x, CONFIG.cards.illustration.yPos * vis.size.y);
        let size = new Point(CONFIG.cards.illustration.scale * vis.sizeUnit);

        if(this.hasAction())
        {
            pos.y = CONFIG.cards.illustration.yPosAction * vis.size.y;
            size = size.clone().scale(CONFIG.cards.illustration.actionScaleDown);
        }

        let frame = this.getTypeData().frame;
        if(this.type == CardType.BLACK) { frame = fromArray(CONFIG.cards.illustration.blackFrames); }

        // bg faded
        const resBG = vis.resLoader.getResource("types_bg");
        const alphaBG = CONFIG.cards.illustration.bgAlpha;
        const composite = CONFIG.cards.illustration.bgComposite;
        const frameBG = rangeInteger(0,3);
        const sizeBG = size.clone().scale(CONFIG.cards.illustration.bgScale);
        const opBG = new LayoutOperation({
            frame: frameBG,
            pos: pos,
            size: sizeBG,
            pivot: Point.CENTER,
            alpha: alphaBG,
            // @ts-ignore
            composite: composite
        })
        group.add(resBG, opBG);

        // actual front picture
        const res = vis.resLoader.getResource("types");
        const effects = vis.inkFriendly ? vis.effectsGrayscaleOnly : [];
        const op = new LayoutOperation({
            frame: frame,
            pos: pos,
            size: size,
            pivot: Point.CENTER,
            effects: effects,
        })
        group.add(res, op);
    }

    drawAction(vis:Visualizer, group)
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
        group.add(new ResourceShape(rect), opRect.clone());

        // the inner rectangle with padding at left/right edge, lighter bg for readability
        const coinPos = new Point(vis.center.x, CONFIG.cards.coins.yPos * vis.size.y);
        const innerHeight = coinPos.y - titlePos.y;
        const rectInner = new Rectangle().fromTopLeft(new Point(0, titlePos.y), new Point(vis.size.x, innerHeight));
        rectInner.extents.x *= CONFIG.cards.action.innerRectDownScale;
        opRect.fill = new ColorLike(colorLight);
        group.add(new ResourceShape(rectInner), opRect.clone());

        const titleTextConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: titleFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        //const strokeWidth = CONFIG.cards.action.strokeWidth * titleFontSize;
        const resTextTitle = new ResourceText({ text: title, textConfig: titleTextConfig });
        const effectsTitle = [new DropShadowEffect({ blurRadius: CONFIG.cards.action.titleGlowRadius * titleFontSize, color: CONFIG.cards.action.titleGlowColor })]

        const opTitle = new LayoutOperation({
            pos: titlePos,
            fill: colorLight,
            size: titleDims,
            pivot: Point.CENTER,
            //stroke: colorDark,
            //strokeWidth: strokeWidth,
            //strokeAlign: StrokeAlign.OUTSIDE
            effects: effectsTitle
        })

        // the action title + pointy rect behind it
        const titleRectDims = CONFIG.cards.title.rectDims.clone().scale(titleDims);
        const pointyRect = vis.getPointyRect(titlePos, titleRectDims);
        const pointyRectOp = new LayoutOperation({
            fill: colorDark
        })

        group.add(new ResourceShape(pointyRect), pointyRectOp);
        group.add(resTextTitle, opTitle);

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
            pos: textPos,
            fill: colorDark,
            size: textDims,
            pivot: Point.CENTER
        })

        group.add(resText, opText);
    }


    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}