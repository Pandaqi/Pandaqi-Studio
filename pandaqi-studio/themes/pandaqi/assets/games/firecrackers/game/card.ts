import { Vector2, Path, createContext, fillCanvas, TextConfig, LayoutOperation, StrokeAlign, ResourceText, strokeCanvas, clamp, MaterialVisualizer, ResourceGroup, TextAlign, ResourceShape, Color, TextWeight, getPositionsCenteredAround, DropShadowEffect, getRectangleCornersWithOffset, Star, fromArray, rangeInteger, Rectangle, ColorLike, colorDarken } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CardMainType, CardType, PACKS, ACTIONS, SCORING_RULES, MISC } from "../shared/dict";

const getPointyRect = (anchor:Vector2, size:Vector2, offset = 0.9) =>
{
    const points = [
        new Vector2(anchor.x - 0.5*size.x, anchor.y),
        new Vector2(anchor.x - 0.5*offset*size.x, anchor.y - 0.5*size.y),
        new Vector2(anchor.x + 0.5*offset*size.x, anchor.y - 0.5*size.y),
        new Vector2(anchor.x + 0.5*size.x, anchor.y),
        new Vector2(anchor.x + 0.5*offset*size.x, anchor.y + 0.5*size.y),
        new Vector2(anchor.x - 0.5*offset*size.x, anchor.y + 0.5*size.y)
    ]
    return new Path(points);
}

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
        textConfig.font = CONFIG._drawing.fonts.heading;

        const strokeWidth = 0.05*cfg.size.x;
        const textOp = new LayoutOperation({
            size: cfg.size,
            pos: cfg.size.clone().scale(0.5),
            pivot: Vector2.CENTER,
            fill: textCol,
            stroke: foreCol,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE
        })

        const resText = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        resText.toCanvas(ctx, textOp);

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

    async draw(vis:MaterialVisualizer)
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
        
        group.toCanvas(ctx);
        return ctx.canvas;
    }

    //
    // Scoreworks cards
    //
    drawBackgroundScore(vis:MaterialVisualizer, ctx)
    {
        fillCanvas(ctx, "#FFFFFF");
    }

    drawScoreRule(vis:MaterialVisualizer, group)
    {
        const data = SCORING_RULES[this.action];
        const titleFontSize = vis.get("cards.scoreRule.titleFontSize") * vis.sizeUnit;
        const titleTextConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: titleFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const title = data.label;
        const resTextTitle = new ResourceText({ text: title, textConfig: titleTextConfig });

        const titlePos = new Vector2(vis.center.x, vis.get("cards.scoreRule.yPosTitle") * vis.size.y);
        const titleDims = new Vector2(vis.size.x, 2*titleFontSize);
        const opTitle = new LayoutOperation({
            pos: titlePos,
            fill: "#FEFEFE",
            size: titleDims,
            pivot: Vector2.CENTER,
        })

        // the action title + pointy rect behind it
        const titleRectDims = vis.get("cards.title.rectDims").clone().scale(titleDims);
        const pointyRect = getPointyRect(titlePos, titleRectDims);
        const pointyRectOp = new LayoutOperation({ fill: "#212121" })

        group.add(new ResourceShape(pointyRect), pointyRectOp);
        group.add(resTextTitle, opTitle);

        // the actual scoring rule
        const text = data.desc;
        const textPos = new Vector2(vis.center.x, vis.get("cards.scoreRule.yPosRule") * vis.size.y);
        const textFontSize = vis.get("cards.scoreRule.ruleFontSize") * vis.sizeUnit;
        const textDims = vis.get("cards.scoreRule.textDims").clone().scale(vis.size);
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
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
            pivot: Vector2.CENTER
        })

        group.add(resText, opText);
    }

    //
    // Play cards
    //
    drawBackground(vis:MaterialVisualizer, ctx)
    {
        let colorDark = this.getTypeData().colorDark;
        if(vis.inkFriendly)
        {
            colorDark = (this.type == CardType.BLACK) ? "#CCCCCC" : vis.get("cards.shared.colorDarkInkFriendly");
        }

        fillCanvas(ctx, colorDark);
    }

    drawCost(vis:MaterialVisualizer, group)
    {
        // draw rectangle behind it
        const yPos = vis.get("cards.coins.yPos");
        const anchorPos = new Vector2(vis.center.x, yPos * vis.size.y);
        const rectDimsRaw = this.hasAction() ? vis.get("cards.coins.rectDimsAction") : vis.get("cards.coins.rectDims");
        const rectDims = rectDimsRaw.clone().scale(vis.size);
        const pointyOffset = this.hasAction() ? vis.get("cards.coins.rectDimsOffsetAction") : vis.get("cards.coins.rectDimsOffset");
        const pointyRect = getPointyRect(anchorPos, rectDims, pointyOffset);
        const typeData = this.getTypeData();
        const color = vis.inkFriendly ? vis.get("cards.shared.colorMidInkFriendly") : typeData.colorMid;

        const rectOp = new LayoutOperation({
            fill: color
        });
        group.add(new ResourceShape(pointyRect), rectOp);

        // @DEBUGGING?
        // draw a reminder that the coins are the card's COST when buying, not its purchase value/worth
        const fontSize = vis.get("cards.coins.fontSize") * vis.sizeUnit;
        const anchorPosCost = new Vector2(anchorPos.x, anchorPos.y - 0.5*rectDims.y);
        const rectDimsCost = new Vector2(7*fontSize, 1.2*fontSize);
        const pointyRect2 = getPointyRect(anchorPosCost, rectDimsCost);

        const rectOp2 = new LayoutOperation({
            fill: colorDarken(new Color(color), vis.get("cards.coins.textRectDarken")),
        })
        group.add(new ResourceShape(pointyRect2), rectOp2);

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
            weight: TextWeight.BOLD
        })
        const resText = new ResourceText({ text: "Cost", textConfig: textConfig });
        const textOp = new LayoutOperation({
            pos: anchorPosCost,
            size: rectDims,
            fill: vis.get("cards.coins.textColor"),
            alpha: vis.get("cards.coins.textAlpha"),
            stroke: "#000000",
            strokeWidth: 0.075 * fontSize,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Vector2.CENTER
        })
        group.add(resText, textOp);

        // draw actual coins
        const cost = this.getPurchaseCost();
        const coinDims = new Vector2(vis.get("cards.coins.scale") * vis.sizeUnit);
        const positions = getPositionsCenteredAround({ pos: anchorPos, num: cost, size: coinDims, dir: Vector2.RIGHT });
        const coinDimsDisplayed = coinDims.clone().scale(vis.get("cards.coins.displayDownScale"));

        const res = vis.resLoader.getResource("misc");
        const frame = MISC.coin.frame;
        const op = new LayoutOperation({
            size: coinDimsDisplayed,
            frame: frame,
            pivot: Vector2.CENTER,
        })

        for(const pos of positions)
        {
            op.pos = pos;
            group.add(res, op.clone());
        }
    }

    drawCorners(vis:MaterialVisualizer, group)
    {
        const glowRadius = vis.get("cards.shared.glowRadius") * vis.sizeUnit;
        const glowColor = vis.get("cards.shared.glowColor");
        const visEffects = [new DropShadowEffect({ blurRadius: glowRadius, color: glowColor })];

        const typeData = this.getTypeData();
        const isAction = this.hasAction();

        const offsetBig = vis.get("cards.corners.edgeOffsetBig").clone().scale(vis.sizeUnit);
        const offsetSmall = vis.get("cards.corners.edgeOffsetSmall").clone().scale(vis.sizeUnit);
        const positionsBig = getRectangleCornersWithOffset(vis.size, offsetBig);
        const positionsSmall = getRectangleCornersWithOffset(vis.size, offsetSmall)

        // @EXCEPTION: on action cards, we move the small numbers to the title pos, to make room for cost at bottom
        if(vis.get("cards.corners.moveSmallStarsToTitle"))
        {
            const titlePos = new Vector2(vis.center.x, vis.get("cards.title.yPos") * vis.size.y);
            for(const elem of positionsSmall)
            {
                elem.y = titlePos.y
            }
        }

        const sizeBig = new Vector2(3 * vis.get("cards.corners.starScaleBig") * vis.sizeUnit);
        const sizeSmall = new Vector2(3 * vis.get("cards.corners.starScaleSmall") * vis.sizeUnit);

        const fontSizeBig = vis.get("cards.corners.fontSizeBig") * vis.sizeUnit;
        const fontSizeSmall = vis.get("cards.corners.fontSizeSmall") * vis.sizeUnit;

        const text = this.num.toString();
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        const colorDark = vis.inkFriendly ? vis.get("cards.shared.colorDarkInkFriendly") : typeData.colorDark;
        const colorMid = vis.inkFriendly ? vis.get("cards.shared.colorMidInkFriendly") : typeData.colorMid;
        const colorLight = vis.inkFriendly ? vis.get("cards.shared.colorLightInkFriendly") : typeData.colorLight;

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
            const starColor = isBig ? colorMid : colorDark;

            const op = new LayoutOperation({
                fill: starColor,
                effects: visEffects
            })
            group.add(resStar, op);

            const strokeWidth = isBig ? vis.get("cards.corners.strokeWidth") * fontSize : 0;
            const tempTextConfig = textConfig.clone();
            tempTextConfig.size = fontSize;
            const resText = new ResourceText({ text: text, textConfig: tempTextConfig });

            const textColor = isBig ? colorDark : colorLight;
            const textStrokeColor = isBig ? colorLight : colorMid;

            // @EXCEPTION: as usual, the number 1 needs to be offset slightly to look centered
            let posOffset = (this.num == 1) ? new Vector2(-0.1*fontSize, 0) : Vector2.ZERO;
            const effects = isBig ? visEffects : [];

            const opText = new LayoutOperation({
                pos: pos.clone().move(posOffset),
                size: size,
                pivot: Vector2.CENTER,
                fill: textColor,
                stroke: textStrokeColor,
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE,
                effects: effects // @IMPROV: not sure if it should copy the regular effects for this text
            })

            group.add(resText, opText);
        }
    }

    drawMainIllustration(vis:MaterialVisualizer, group)
    {
        const pos = new Vector2(vis.center.x, vis.get("cards.illustration.yPos") * vis.size.y);
        let size = new Vector2(vis.get("cards.illustration.scale") * vis.sizeUnit);

        if(this.hasAction())
        {
            pos.y = vis.get("cards.illustration.yPosAction") * vis.size.y;
            size = size.clone().scale(vis.get("cards.illustration.actionScaleDown"));
        }

        let frame = this.getTypeData().frame;
        if(this.type == CardType.BLACK) { frame = fromArray(vis.get("cards.illustration.blackFrames")); }

        // bg faded
        const resBG = vis.resLoader.getResource("types_bg");
        const alphaBG = vis.get("cards.illustration.bgAlpha");
        const composite = vis.get("cards.illustration.bgComposite");
        const frameBG = rangeInteger(0,3);
        const sizeBG = size.clone().scale(vis.get("cards.illustration.bgScale"));
        const opBG = new LayoutOperation({
            frame: frameBG,
            pos: pos,
            size: sizeBG,
            pivot: Vector2.CENTER,
            alpha: alphaBG,
            // @ts-ignore
            composite: composite
        })
        group.add(resBG, opBG);

        // actual front picture
        const res = vis.resLoader.getResource("types");
        const op = new LayoutOperation({
            frame: frame,
            pos: pos,
            size: size,
            pivot: Vector2.CENTER,
            effects: vis.inkFriendlyEffect,
        })
        group.add(res, op);
    }

    drawAction(vis:MaterialVisualizer, group)
    {
        if(!this.hasAction()) { return; }

        const typeData = this.getTypeData();
        
        const actionData = this.getActionData();
        const title = actionData.label;
        const titlePos = new Vector2(vis.center.x, vis.get("cards.title.yPos") * vis.size.y);
        const titleFontSize = vis.get("cards.title.fontSize") * vis.sizeUnit;
        const titleDims = new Vector2(vis.size.x, 2*titleFontSize);

        const colorMid = vis.inkFriendly ? vis.get("cards.shared.colorMidInkFriendly") : typeData.colorMid;
        const colorLight = vis.inkFriendly ? vis.get("cards.shared.colorLightInkFriendly") : typeData.colorLight;
        const colorDark = vis.inkFriendly ? vis.get("cards.shared.colorDarkInkFriendly") : typeData.colorDark;

        // the general rectangle behind everything (lines up with title precisely, which is why we calculate that first)
        const rect = new Rectangle().fromTopLeft(new Vector2(0, titlePos.y), new Vector2(vis.size.x, vis.size.y - titlePos.y));
        const opRect = new LayoutOperation({
            fill: colorMid
        })
        group.add(new ResourceShape(rect), opRect.clone());

        // the inner rectangle with padding at left/right edge, lighter bg for readability
        const coinPos = new Vector2(vis.center.x, vis.get("cards.coins.yPos") * vis.size.y);
        const innerHeight = coinPos.y - titlePos.y;
        const rectInner = new Rectangle().fromTopLeft(new Vector2(0, titlePos.y), new Vector2(vis.size.x, innerHeight));
        rectInner.extents.x *= vis.get("cards.action.innerRectDownScale");
        opRect.fill = new ColorLike(colorLight);
        group.add(new ResourceShape(rectInner), opRect.clone());

        const titleTextConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: titleFontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        })

        //const strokeWidth = vis.get("cards.action.strokeWidth") * titleFontSize;
        const resTextTitle = new ResourceText({ text: title, textConfig: titleTextConfig });
        const effectsTitle = [new DropShadowEffect({ blurRadius: vis.get("cards.action.titleGlowRadius") * titleFontSize, color: vis.get("cards.action.titleGlowColor") })]

        const opTitle = new LayoutOperation({
            pos: titlePos,
            fill: colorLight,
            size: titleDims,
            pivot: Vector2.CENTER,
            //stroke: colorDark,
            //strokeWidth: strokeWidth,
            //strokeAlign: StrokeAlign.OUTSIDE
            effects: effectsTitle
        })

        // the action title + pointy rect behind it
        const titleRectDims = vis.get("cards.title.rectDims").clone().scale(titleDims);
        const pointyRect = getPointyRect(titlePos, titleRectDims);
        const pointyRectOp = new LayoutOperation({
            fill: colorDark
        })

        group.add(new ResourceShape(pointyRect), pointyRectOp);
        group.add(resTextTitle, opTitle);

        // then the actual action text
        const text = actionData.desc;
        const textPos = new Vector2(vis.center.x, vis.get("cards.action.yPos") * vis.size.y);
        const textFontSize = vis.get("cards.action.fontSize") * vis.sizeUnit;
        const textDims = vis.get("cards.action.textDims").clone().scale(vis.size);
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
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
            pivot: Vector2.CENTER
        })

        group.add(resText, opText);
    }
}