import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import bevelCorners from "js/pq_games/tools/geometry/paths/bevelCorners";
import Path from "js/pq_games/tools/geometry/paths/path";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import movePath from "js/pq_games/tools/geometry/transform/movePath";
import CONFIG from "../js_shared/config";
import { CATS, MISC, SUITS, Type } from "../js_shared/dict";
import Visualizer from "./visualizer";

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

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });

        // background color
        let bgColor = SUITS[this.suit].color;
        fillCanvas(ctx, bgColor);

        // the number
        this.drawBigNumber(vis, ctx);

        // finish it off
        this.drawOutline(vis, ctx);

        const img = await convertCanvasToImage(ctx.canvas);
        return img;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });

        this.drawBackground(vis, ctx);

        if(this.type == Type.LIFE) {
            this.drawLifeCard(vis,ctx);
        } else {
            this.drawNumberCard(vis, ctx);
        }

        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    //
    // > LIFE CARDS
    //
    drawLifeCard(vis:Visualizer, ctx)
    {
        this.drawCatIllustration(vis, ctx);
        this.drawPowerText(vis, ctx);
        this.drawLivesHeart(vis, ctx);
    }

    isRuleReminder()
    {
        return CONFIG.generation.numberCards.highestCardIsRuleReminder && this.num >= 9;
    }

    drawCatIllustration(vis:Visualizer, ctx)
    {
        // actual illustration
        const res = vis.resLoader.getResource("cats");
        const frame = CATS[this.cat].frame;
        const size = new Point(vis.size.x * CONFIG.cards.cat.sizeFactor);
        const offset = CONFIG.cards.cat.offset.clone().scaleFactor(vis.sizeUnit);
        const pos = new Point(0.5*vis.size.x).move(offset);
        const alpha = this.isRuleReminder() ? CONFIG.cards.cat.rulesReminderCatAlpha : 1.0;
        const catEffects = [];
        if(vis.inkFriendly) { catEffects.push(new GrayScaleEffect()); }

        const op = new LayoutOperation({
            pos: pos,
            size: size,
            frame: frame,
            pivot: new Point(0.5),
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
            op.size = op.size.clone().scaleFactor(CONFIG.cards.cat.rulesReminderScale);
            res.toCanvas(ctx, op);
        }

        // two small rectangles to make transition to bottom look better
        const bottomEdge = pos.clone().move(new Point(0, 0.5*size.y));
        const strokeWidth = CONFIG.cards.sharedStrokeWidth * vis.sizeUnit;
        const extraRectHeight = CONFIG.cards.cat.extraRectHeight * vis.sizeUnit;
        const posAbove = bottomEdge.clone().move(new Point(0, -0.5*extraRectHeight));
        const rectAbove = new Rectangle({ extents: new Point(vis.size.x, extraRectHeight) })
        const resAbove = new ResourceShape({ shape: rectAbove });
        const opAbove = new LayoutOperation({
            pos: posAbove,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            alpha: CONFIG.cards.cat.extraRectAlpha
        })
        resAbove.toCanvas(ctx, opAbove);

        const posBelow = bottomEdge.clone().move(new Point(0, 0.5*extraRectHeight));
        opAbove.pos = posBelow;
        resAbove.toCanvas(ctx, opAbove);

        // the cat's name
        const fontSize = CONFIG.cards.cat.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        });
        const catName = CATS[this.cat].label;
        const textRes = new ResourceText({ text: catName, textConfig: textConfig });

        const offsetInward = CONFIG.cards.cat.textOffset * fontSize;
        const effects = [new DropShadowEffect({ blurRadius: 0.1*fontSize, color: CONFIG.cards.sharedShadowColor })];

        const textOp = new LayoutOperation({
            pos: new Point(offsetInward, pos.y),
            size: new Point(1000, fontSize),
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: strokeWidth * CONFIG.cards.cat.strokeWidthFactor,
            strokeAlign: StrokeAlign.OUTSIDE,
            rot: -0.5*Math.PI,
            pivot: new Point(0.5),
            effects: effects
        })
        textRes.toCanvas(ctx, textOp);

        textOp.rot = 0.5*Math.PI;
        textOp.pos.x = vis.size.x - offsetInward;
        textRes.toCanvas(ctx, textOp);
    }

    drawLivesHeart(vis:Visualizer, ctx)
    {
        // first icon in background
        const resIcon = vis.resLoader.getResource("misc");
        const frame = MISC.heart.frame;
        const yPos = CONFIG.cards.lives.yPos * vis.size.y;
        const pos = new Point(0.5*vis.size.x, yPos);
        const iconSize = new Point(CONFIG.cards.lives.iconSize * vis.sizeUnit);
        const effects : any[] = [new DropShadowEffect({ offset: iconSize.clone().scaleFactor(0.025), color: CONFIG.cards.sharedShadowColor })];
        if(vis.inkFriendly) { effects.push(new GrayScaleEffect()); }
        
        const opIcon = new LayoutOperation({
            pos: pos,
            frame: frame,
            size: iconSize,
            pivot: new Point(0.5),
            effects: effects
        })

        resIcon.toCanvas(ctx, opIcon);

        // then text on top
        const strokeWidth = CONFIG.cards.sharedStrokeWidth * vis.sizeUnit;
        const fontSize = CONFIG.cards.lives.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const textPos = pos.clone();
        // @NOTE: these numbers have a weird optic center, so compensate
        if(this.num == 1 || this.num == 4)
        {
            textPos.move(new Point(-0.025*fontSize, 0));
        }

        const op = new LayoutOperation({
            pos: textPos,
            size: new Point(2*fontSize),
            pivot: new Point(0.5),
            fill: vis.inkFriendly ? "#FFFFFF" : "#FFE7D5",
            stroke: vis.inkFriendly ? "#111111" : "#4B0300",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            effects: effects
        })

        const res = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        res.toCanvas(ctx, op);

        const sideOffset = CONFIG.cards.lives.handIconSideOffset * vis.size.x;
        const topOffset = 0; // not needed anymore, right?
        const handIconPositions = 
        [
            new Point(sideOffset, pos.y + topOffset),
            new Point(vis.size.x - sideOffset, pos.y + topOffset)
        ]

        for(let i = 0; i < 2; i++)
        {
            // hand limit icon
            const resHand = vis.resLoader.getResource("misc");
            const handIconSize = CONFIG.cards.lives.handIconSize * vis.sizeUnit;
            const pos = handIconPositions[i];
            const handOp = new LayoutOperation({
                frame: MISC.hand.frame,
                pos: pos,
                size: new Point(handIconSize),
                pivot: Point.CENTER,
                effects: effects,
                flipX: (i == 1),
            })

            resHand.toCanvas(ctx, handOp);

            // hand limit number
            const limit = CONFIG.generation.lifeCards.handLimits[this.num-1];
            const fontSize = CONFIG.cards.lives.handIconFontSize * vis.sizeUnit;
            textConfig.size = fontSize;
            const moveDir = i == 0 ? 1 : -1;
            const resHandText = new ResourceText({ text: limit.toString(), textConfig: textConfig });
            const handTextOp = new LayoutOperation({
                pos: pos.clone().move(new Point(moveDir * 0.5 * fontSize, 0)),
                size: new Point(vis.size.x, fontSize),
                pivot: Point.CENTER,
                fill: vis.inkFriendly ? "#ECECEC" : "#B3FFFE",
                stroke: vis.inkFriendly ? "#323232" : "#003938",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE
            })
            resHandText.toCanvas(ctx, handTextOp);
        }
        
    }

    drawPowerText(vis:Visualizer, ctx)
    {
        if(this.isRuleReminder() || !this.power) { return; }

        const fontSize = CONFIG.cards.power.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            resLoader: vis.resLoader
        }).alignCenter();

        // some small vector magic to create a rectangle with the corners cut/beveled
        const yPos = CONFIG.cards.power.yPos * vis.size.y;
        const pos = new Point(0.5*vis.size.x, yPos);
        const rectSize = CONFIG.cards.power.rectSize.clone().scale(vis.size);
        const rectSizeUnit = Math.min(rectSize.x, rectSize.y);

        const corners : Point[] = 
        [
            rectSize.clone().scaleFactor(-0.5),
            new Point(0.5*rectSize.x, -0.5*rectSize.y),
            new Point(0.5*rectSize.x, 0.5*rectSize.y),
            new Point(-0.5*rectSize.x, 0.5*rectSize.y)
        ]

        const cutOffset = CONFIG.cards.power.rectCutSize * rectSizeUnit;
        const rectCut = bevelCorners(corners, cutOffset);

        const strokeWidth = CONFIG.cards.sharedStrokeWidth * vis.sizeUnit;
        const effects = [new DropShadowEffect({ offset: new Point(fontSize*0.2), color: CONFIG.cards.sharedShadowColor })];
        const opRect = new LayoutOperation({
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            effects: effects
        });

        const points = movePath(rectCut, pos);
        const path = new Path({ points: points, close: true });
        const resShape = new ResourceShape({ shape: path });
        resShape.toCanvas(ctx, opRect);

        // then put the actual text inside it
        const opText = new LayoutOperation({
            pos: new Point(vis.center.x, pos.y),
            size: rectSize,
            pivot: Point.CENTER,
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
    drawNumberCard(vis:Visualizer, ctx)
    {
        this.drawNumbers(vis, ctx);
        this.drawSuits(vis, ctx);
        this.drawMainPart(vis, ctx);
    }

    drawBigNumber(vis:Visualizer, ctx)
    {
        // the number
        const fontSize = CONFIG.cards.numbers.fontSizeBig * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
        }).alignCenter();

        const strokeWidth = CONFIG.cards.sharedStrokeWidth * vis.sizeUnit;
        const shadowOffset = new Point(CONFIG.cards.sharedShadowOffset * vis.sizeUnit);
        const effects = [new DropShadowEffect({ offset: shadowOffset, color: CONFIG.cards.sharedShadowColor })];
        const iconSize = CONFIG.cards.suits.bigSuitSize * vis.sizeUnit
        const center = vis.size.clone().scale(0.5);

        const op = new LayoutOperation({
            size: new Point(iconSize*3), // @TODO: if no size given, just make size "whatever needed"?
            pos: center,
            pivot: new Point(0.5),
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

    drawMainPart(vis:Visualizer, ctx)
    {
        const center = vis.size.clone().scaleFactor(0.5);

        // the abstract suit icon behind it
        const resIcon = vis.resLoader.getResource("suits");
        const frame = this.data.frame + 1;
        const iconSize = CONFIG.cards.suits.bigSuitSize * vis.sizeUnit
        const opIcon = new LayoutOperation({
            frame: frame,
            pos: center,
            size: new Point(iconSize),
            pivot: new Point(0.5),
            alpha: CONFIG.cards.suits.bigSuitAlpha
        })

        resIcon.toCanvas(ctx, opIcon);

        const op = this.drawBigNumber(vis, ctx);

        const is6or9 = (this.num == 6 || this.num == 9);
        const needsLine = is6or9
        if(!needsLine) { return; }

        const fontSize = CONFIG.cards.numbers.fontSizeBig * vis.sizeUnit;
        const lineCenter = center.clone().move(new Point(0, CONFIG.cards.numbers.clarityLineOffsetY*fontSize));
        const lineExtents = CONFIG.cards.numbers.clarityLineSize.clone().scale(fontSize);
        const rect = new Rectangle({ center: lineCenter, extents: lineExtents });
        const bevelSize = CONFIG.cards.numbers.clarityLineBevel * Math.min(lineExtents.x, lineExtents.y);
        const path = bevelCorners(rect.toPath(), bevelSize);
        const pathObj = new Path({ points: path, close: true });
        const resLine = new ResourceShape({ shape: pathObj });

        op.pos = new Point();
        op.size = new Point();
        op.pivot = new Point();
        resLine.toCanvas(ctx, op);
        
    }

    drawNumbers(vis:Visualizer, ctx)
    {
        const edges = [
            new Point(0.5*vis.size.x, 0),
            new Point(vis.size.x, 0.5*vis.size.y),
            new Point(0.5*vis.size.x, vis.size.y),
            new Point(0, 0.5*vis.size.y)
        ]

        const offsets = [
            Point.DOWN,
            Point.LEFT,
            Point.UP,
            Point.RIGHT
        ]

        const fontSize = CONFIG.cards.numbers.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const textOffset = CONFIG.cards.numbers.offsetFromEdge * fontSize;
        const strokeWidth = CONFIG.cards.sharedStrokeWidth * vis.sizeUnit;

        for(let i = 0; i < edges.length; i++)
        {
            let text = this.num.toString();

            const rot = (i <= 1) ? 0 : Math.PI;
            const res = new ResourceText({ text: text, textConfig: textConfig });
            const pos = edges[i].clone().move(offsets[i].clone().scaleFactor(textOffset));
            const op = new LayoutOperation({
                size: new Point(4*fontSize, fontSize),
                pos: pos,
                pivot: new Point(0.5),
                fill: "#FFFFFF",
                stroke: "#000000",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE,
                rot: rot
            });
            res.toCanvas(ctx, op);
        }
    }

    drawSuits(vis:Visualizer, ctx)
    {
        const corners = [
            new Point(),
            new Point(vis.size.x, 0),
            vis.size.clone(),
            new Point(0, vis.size.y)
        ]

        const offsets = [
            new Point(1,1),
            new Point(-1,1),
            new Point(-1,-1),
            new Point(1,-1)
        ]

        const offset = CONFIG.cards.suits.offset.clone().scaleFactor(vis.sizeUnit);
        const iconSize = new Point(CONFIG.cards.suits.iconSize * vis.sizeUnit);
        const frame = this.data.frame;
        const res = vis.resLoader.getResource("suits");
        const effects : any[] = [
            new DropShadowEffect({ offset: iconSize.clone().scaleFactor(0.1), color: CONFIG.cards.sharedShadowColor }),
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
                pivot: new Point(0.5),
                rot: rot,
                effects: effects
            })
            res.toCanvas(ctx, op);
        }
    }

    //
    // > SHARED
    //
    drawBackground(vis:Visualizer, ctx)
    {
        let color = this.data.color;
        if(this.type == Type.LIFE) { color = CATS[this.cat].color; }
        if(vis.inkFriendly) { color = "#FFFFFF"; }

        let alpha = CONFIG.cards.bgCats.patternAlpha;
        if(vis.inkFriendly) { alpha *= 0.25; }

        fillCanvas(ctx, color);

        const center = vis.size.clone().scaleFactor(0.5);
        const op = new LayoutOperation({
            pos: center,
            alpha: alpha,
            rot: CONFIG.cards.bgCats.patternRotation,
            pivot: new Point(0.5)
        })
        vis.patternCat.toCanvas(ctx, op);
    }

    drawOutline(vis, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}