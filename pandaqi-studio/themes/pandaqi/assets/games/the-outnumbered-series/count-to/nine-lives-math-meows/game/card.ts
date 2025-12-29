

import { MaterialVisualizer, createContext, Vector2, LayoutOperation, convertCanvasToImage, ResourceImage, fillCanvas, GrayScaleEffect, Rectangle, ResourceShape, TextConfig, TextAlign, ResourceText, DropShadowEffect, StrokeAlign, bevelCorners, movePath, Path, strokeCanvas } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CATS, MISC, SUITS, Type } from "../shared/dict";


const cacheVisualizerData = async (vis:MaterialVisualizer) =>
{
    const alreadyCached = vis.custom && Object.keys(vis.custom).length > 0;
    if(alreadyCached) { return; }

    const patternSize = (1.0 + vis.get("cards.bgCats.patternExtraMargin")) * vis.size.y;
    const num = vis.get("cards.bgCats.patternNumIcons");
    const distBetweenIcons = patternSize / num;
    const iconSize = vis.get("cards.bgCats.patternIconSize") * distBetweenIcons;

    const ctx = createContext({ size: new Vector2(patternSize) });
    for(let x = 0; x < num; x++)
    {
        for(let y = 0; y < num; y++)
        {
            const res = vis.getResource("misc");
            const pos = new Vector2(x,y).scaleFactor(distBetweenIcons);
            const frame = MISC.bg_cat.frame;
            const op = new LayoutOperation({
                frame: frame,
                pos: pos,
                size: new Vector2(iconSize),
                pivot: new Vector2(0.5),
            })
            await res.toCanvas(ctx, op);
        }
    }

    const img = await convertCanvasToImage(ctx.canvas);
    const res = new ResourceImage(img);
    vis.custom = { patternCat: res };
}


export default class Card
{
    type: Type; // LIFE or NUMBER
    num: number; 
    cat: string;
    suit: string;
    power: string; // reference to key in POWERS dict; not the power text itself!
    data: Record<string, any>; // data associated with POWER (might be dynamically generated in some cases)
    handLimit: number;

    constructor(type:Type, num:number)
    {
        this.type = type;
        this.num = num;
    }

    async drawForRules(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        await cacheVisualizerData(vis);

        const ctx = createContext({ size: vis.size });

        // background color
        let bgColor = SUITS[this.suit].color;
        fillCanvas(ctx, bgColor);

        // the number
        this.drawBigNumber(vis, ctx);

        return ctx.canvas;
    }

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        await cacheVisualizerData(vis);

        const ctx = createContext({ size: vis.size });

        this.drawBackground(vis, ctx);

        if(this.type == Type.LIFE) {
            this.drawLifeCard(vis,ctx);
        } else {
            this.drawNumberCard(vis, ctx);
        }

        return ctx.canvas;
    }

    //
    // > LIFE CARDS
    //
    drawLifeCard(vis:MaterialVisualizer, ctx)
    {
        this.drawCatIllustration(vis, ctx);
        this.drawPowerText(vis, ctx);
        this.drawLivesHeart(vis, ctx);
    }

    isRuleReminder()
    {
        return CONFIG.generation.numberCards.highestCardIsRuleReminder && this.num >= 9;
    }

    drawCatIllustration(vis:MaterialVisualizer, ctx)
    {
        // actual illustration
        const res = vis.resLoader.getResource("cats");
        const frame = CATS[this.cat].frame;
        const size = new Vector2(vis.size.x * vis.get("cards.cat.sizeFactor"));
        const offset = vis.get("cards.cat.offset").clone().scaleFactor(vis.sizeUnit);
        const pos = new Vector2(0.5*vis.size.x).move(offset);
        const alpha = this.isRuleReminder() ? vis.get("cards.cat.rulesReminderCatAlpha") : 1.0;
        const catEffects = [];
        if(vis.inkFriendly) { catEffects.push(new GrayScaleEffect()); }

        const op = new LayoutOperation({
            pos: pos,
            size: size,
            frame: frame,
            pivot: new Vector2(0.5),
            alpha: alpha,
            effects: catEffects
        })
        res.toCanvas(ctx, op);

        // rule reminder on top, if enabled
        if(this.isRuleReminder())
        {
            const res = vis.resLoader.getResource("misc");
            op.frame = MISC.rulesReminder.frame;
            op.alpha = 1.0;
            op.size = op.size.clone().scaleFactor(vis.get("cards.cat.rulesReminderScale"));
            res.toCanvas(ctx, op);
        }

        // two small rectangles to make transition to bottom look better
        const bottomEdge = pos.clone().move(new Vector2(0, 0.5*size.y));
        const strokeWidth = vis.get("cards.sharedStrokeWidth") * vis.sizeUnit;
        const extraRectHeight = vis.get("cards.cat.extraRectHeight") * vis.sizeUnit;
        const posAbove = bottomEdge.clone().move(new Vector2(0, -0.5*extraRectHeight));
        const rectAbove = new Rectangle({ extents: new Vector2(vis.size.x, extraRectHeight) })
        const resAbove = new ResourceShape({ shape: rectAbove });
        const opAbove = new LayoutOperation({
            pos: posAbove,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            alpha: vis.get("cards.cat.extraRectAlpha")
        })
        resAbove.toCanvas(ctx, opAbove);

        const posBelow = bottomEdge.clone().move(new Vector2(0, 0.5*extraRectHeight));
        opAbove.pos = posBelow;
        resAbove.toCanvas(ctx, opAbove);

        // the cat's name
        const fontSize = vis.get("cards.cat.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        });
        const catName = CATS[this.cat].label;
        const textRes = new ResourceText({ text: catName, textConfig: textConfig });

        const offsetInward = vis.get("cards.cat.textOffset") * fontSize;
        const effects = [new DropShadowEffect({ blurRadius: 0.1*fontSize, color: vis.get("cards.sharedShadowColor") })];

        const textOp = new LayoutOperation({
            pos: new Vector2(offsetInward, pos.y),
            size: new Vector2(1000, fontSize),
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: strokeWidth * vis.get("cards.cat.strokeWidthFactor"),
            strokeAlign: StrokeAlign.OUTSIDE,
            rot: -0.5*Math.PI,
            pivot: new Vector2(0.5),
            effects: effects
        })
        textRes.toCanvas(ctx, textOp);

        textOp.rot = 0.5*Math.PI;
        textOp.pos.x = vis.size.x - offsetInward;
        textRes.toCanvas(ctx, textOp);
    }

    drawLivesHeart(vis:MaterialVisualizer, ctx)
    {
        // first icon in background
        const resIcon = vis.resLoader.getResource("misc");
        const frame = MISC.heart.frame;
        const yPos = vis.get("cards.lives.yPos") * vis.size.y;
        const pos = new Vector2(0.5*vis.size.x, yPos);
        const iconSize = new Vector2(vis.get("cards.lives.iconSize") * vis.sizeUnit);
        const effects : any[] = [new DropShadowEffect({ offset: iconSize.clone().scaleFactor(0.025), color: vis.get("cards.sharedShadowColor") })];
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }
        
        const opIcon = new LayoutOperation({
            pos: pos,
            frame: frame,
            size: iconSize,
            pivot: new Vector2(0.5),
            effects: effects
        })

        resIcon.toCanvas(ctx, opIcon);

        // then text on top
        const strokeWidth = vis.get("cards.sharedStrokeWidth") * vis.sizeUnit;
        const fontSize = vis.get("cards.lives.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const textPos = pos.clone();
        // @NOTE: these numbers have a weird optic center, so compensate
        if(this.num == 1 || this.num == 4)
        {
            textPos.move(new Vector2(-0.025*fontSize, 0));
        }

        const op = new LayoutOperation({
            pos: textPos,
            size: new Vector2(2*fontSize),
            pivot: new Vector2(0.5),
            fill: vis.inkFriendly ? "#FFFFFF" : "#FFE7D5",
            stroke: vis.inkFriendly ? "#111111" : "#4B0300",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            effects: effects
        })

        const res = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        res.toCanvas(ctx, op);

        const sideOffset = vis.get("cards.lives.handIconSideOffset") * vis.size.x;
        const topOffset = 0; // not needed anymore, right?
        const handIconPositions = 
        [
            new Vector2(sideOffset, pos.y + topOffset),
            new Vector2(vis.size.x - sideOffset, pos.y + topOffset)
        ]

        for(let i = 0; i < 2; i++)
        {
            // hand limit icon
            const resHand = vis.resLoader.getResource("misc");
            const handIconSize = vis.get("cards.lives.handIconSize") * vis.sizeUnit;
            const pos = handIconPositions[i];
            const handOp = new LayoutOperation({
                frame: MISC.hand.frame,
                pos: pos,
                size: new Vector2(handIconSize),
                pivot: Vector2.CENTER,
                effects: effects,
                flipX: (i == 1),
            })

            resHand.toCanvas(ctx, handOp);

            // hand limit number
            const limit = CONFIG.generation.lifeCards.handLimits[this.num-1];
            const fontSize = vis.get("cards.lives.handIconFontSize") * vis.sizeUnit;
            textConfig.size = fontSize;
            const moveDir = i == 0 ? 1 : -1;
            const resHandText = new ResourceText({ text: limit.toString(), textConfig: textConfig });
            const handTextOp = new LayoutOperation({
                pos: pos.clone().move(new Vector2(moveDir * 0.5 * fontSize, 0)),
                size: new Vector2(vis.size.x, fontSize),
                pivot: Vector2.CENTER,
                fill: vis.inkFriendly ? "#ECECEC" : "#B3FFFE",
                stroke: vis.inkFriendly ? "#323232" : "#003938",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE
            })
            resHandText.toCanvas(ctx, handTextOp);
        }
        
    }

    drawPowerText(vis:MaterialVisualizer, ctx)
    {
        if(this.isRuleReminder() || !this.power) { return; }

        const fontSize = vis.get("cards.power.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            resLoader: vis.resLoader
        }).alignCenter();

        // some small vector magic to create a rectangle with the corners cut/beveled
        const yPos = vis.get("cards.power.yPos") * vis.size.y;
        const pos = new Vector2(0.5*vis.size.x, yPos);
        const rectSize = vis.get("cards.power.rectSize").clone().scale(vis.size);
        const rectSizeUnit = Math.min(rectSize.x, rectSize.y);

        const corners : Vector2[] = 
        [
            rectSize.clone().scaleFactor(-0.5),
            new Vector2(0.5*rectSize.x, -0.5*rectSize.y),
            new Vector2(0.5*rectSize.x, 0.5*rectSize.y),
            new Vector2(-0.5*rectSize.x, 0.5*rectSize.y)
        ]

        const cutOffset = vis.get("cards.power.rectCutSize") * rectSizeUnit;
        const rectCut = bevelCorners(corners, cutOffset);

        const strokeWidth = vis.get("cards.sharedStrokeWidth") * vis.sizeUnit;
        const effects = [new DropShadowEffect({ offset: new Vector2(fontSize*0.2), color: vis.get("cards.sharedShadowColor") })];
        const opRect = new LayoutOperation({
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            effects: effects
        });

        const points = movePath(rectCut, pos);
        const path = new Path(points, true);
        const resShape = new ResourceShape({ shape: path });
        resShape.toCanvas(ctx, opRect);

        // then put the actual text inside it
        const opText = new LayoutOperation({
            pos: new Vector2(vis.center.x, pos.y),
            size: rectSize,
            pivot: Vector2.CENTER,
            fill: "#000000"
        });

        const desc = this.data.desc.split(" ");
        const suitNames = Object.keys(SUITS);
        const descOutput = [];
        for(let word of desc)
        {
            const isIcon = suitNames.includes(word);
            if(isIcon) 
            {
                word = '<img id="suits" frame="' + SUITS[word].frame + '">';
            }
            descOutput.push(word);
        }

        const descFinal = descOutput.join(" ");
        const resText = new ResourceText({ text: descFinal, textConfig: textConfig });
        resText.toCanvas(ctx, opText);
    }

    //
    // > NUMBER cards 
    //
    drawNumberCard(vis:MaterialVisualizer, ctx)
    {
        this.drawNumbers(vis, ctx);
        this.drawSuits(vis, ctx);
        this.drawMainPart(vis, ctx);
    }

    drawBigNumber(vis:MaterialVisualizer, ctx)
    {
        // the number
        const fontSize = vis.get("cards.numbers.fontSizeBig") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        }).alignCenter();

        const strokeWidth = vis.get("cards.sharedStrokeWidth") * vis.sizeUnit;
        const shadowOffset = new Vector2(vis.get("cards.sharedShadowOffset") * vis.sizeUnit);
        const effects = [new DropShadowEffect({ offset: shadowOffset, color: vis.get("cards.sharedShadowColor") })];
        const iconSize = vis.get("cards.suits.bigSuitSize") * vis.sizeUnit
        const center = vis.size.clone().scale(0.5);

        const op = new LayoutOperation({
            size: new Vector2(iconSize*3),
            pos: center,
            pivot: new Vector2(0.5),
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            effects: effects
        })

        const res = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        res.toCanvas(ctx, op);

        return op;
    }

    drawMainPart(vis:MaterialVisualizer, ctx)
    {
        const center = vis.size.clone().scaleFactor(0.5);

        // the abstract suit icon behind it
        const resIcon = vis.resLoader.getResource("suits");
        const frame = this.data.frame + 1;
        const iconSize = vis.get("cards.suits.bigSuitSize") * vis.sizeUnit
        const opIcon = new LayoutOperation({
            frame: frame,
            pos: center,
            size: new Vector2(iconSize),
            pivot: new Vector2(0.5),
            alpha: vis.get("cards.suits.bigSuitAlpha")
        })

        resIcon.toCanvas(ctx, opIcon);

        const op = this.drawBigNumber(vis, ctx);

        const is6or9 = (this.num == 6 || this.num == 9);
        const needsLine = is6or9
        if(!needsLine) { return; }

        const fontSize = vis.get("cards.numbers.fontSizeBig") * vis.sizeUnit;
        const lineCenter = center.clone().move(new Vector2(0, vis.get("cards.numbers.clarityLineOffsetY")*fontSize));
        const lineExtents = vis.get("cards.numbers.clarityLineSize").clone().scale(fontSize);
        const rect = new Rectangle({ center: lineCenter, extents: lineExtents });
        const bevelSize = vis.get("cards.numbers.clarityLineBevel") * Math.min(lineExtents.x, lineExtents.y);
        const path = bevelCorners(rect.toPathArray(), bevelSize);
        const pathObj = new Path(path, true);
        const resLine = new ResourceShape({ shape: pathObj });

        op.pos = new Vector2();
        op.size = new Vector2();
        op.pivot = new Vector2();
        resLine.toCanvas(ctx, op);
        
    }

    drawNumbers(vis:MaterialVisualizer, ctx)
    {
        const edges = [
            new Vector2(0.5*vis.size.x, 0),
            new Vector2(vis.size.x, 0.5*vis.size.y),
            new Vector2(0.5*vis.size.x, vis.size.y),
            new Vector2(0, 0.5*vis.size.y)
        ]

        const offsets = [
            Vector2.DOWN,
            Vector2.LEFT,
            Vector2.UP,
            Vector2.RIGHT
        ]

        const fontSize = vis.get("cards.numbers.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const textOffset = vis.get("cards.numbers.offsetFromEdge") * fontSize;
        const strokeWidth = vis.get("cards.sharedStrokeWidth") * vis.sizeUnit;

        for(let i = 0; i < edges.length; i++)
        {
            let text = this.num.toString();

            const rot = (i <= 1) ? 0 : Math.PI;
            const res = new ResourceText({ text: text, textConfig: textConfig });
            const pos = edges[i].clone().move(offsets[i].clone().scaleFactor(textOffset));
            const op = new LayoutOperation({
                size: new Vector2(4*fontSize, fontSize),
                pos: pos,
                pivot: new Vector2(0.5),
                fill: "#FFFFFF",
                stroke: "#000000",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE,
                rot: rot
            });
            res.toCanvas(ctx, op);
        }
    }

    drawSuits(vis:MaterialVisualizer, ctx)
    {
        const corners = [
            new Vector2(),
            new Vector2(vis.size.x, 0),
            vis.size.clone(),
            new Vector2(0, vis.size.y)
        ]

        const offsets = [
            new Vector2(1,1),
            new Vector2(-1,1),
            new Vector2(-1,-1),
            new Vector2(1,-1)
        ]

        const offset = vis.get("cards.suits.offset").clone().scaleFactor(vis.sizeUnit);
        const iconSize = new Vector2(vis.get("cards.suits.iconSize") * vis.sizeUnit);
        const frame = this.data.frame;
        const res = vis.resLoader.getResource("suits");
        const effects : any[] = [
            new DropShadowEffect({ offset: iconSize.clone().scaleFactor(0.1), color: vis.get("cards.sharedShadowColor") }),
        ];
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }

        for(let i = 0; i < corners.length; i++)
        {
            const pos = corners[i].clone().move(offsets[i].clone().scale(offset));
            const rot = i <= 1 ? 0 : Math.PI;
            const op = new LayoutOperation({
                frame: frame,
                size: iconSize,
                pos: pos,
                pivot: new Vector2(0.5),
                rot: rot,
                effects: effects
            })
            res.toCanvas(ctx, op);
        }
    }

    //
    // > SHARED
    //
    drawBackground(vis:MaterialVisualizer, ctx)
    {
        let color = this.data.color;
        if(this.type == Type.LIFE) { color = CATS[this.cat].color; }
        if(vis.inkFriendly) { color = "#FFFFFF"; }

        let alpha = vis.get("cards.bgCats.patternAlpha");
        if(vis.inkFriendly) { alpha *= 0.25; }

        fillCanvas(ctx, color);

        const center = vis.size.clone().scaleFactor(0.5);
        const op = new LayoutOperation({
            pos: center,
            alpha: alpha,
            rot: vis.get("cards.bgCats.patternRotation"),
            pivot: new Vector2(0.5)
        })
        vis.custom.patternCat.toCanvas(ctx, op);
    }
}