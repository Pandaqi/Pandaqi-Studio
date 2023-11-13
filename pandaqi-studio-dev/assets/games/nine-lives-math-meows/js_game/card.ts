import createContext from "js/pq_games/layout/canvas/createContext";
import { CATS, MISC, SUITS, Type } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import Visualizer from "./visualizer";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import movePath from "js/pq_games/tools/geometry/transform/movePath";
import Path from "js/pq_games/tools/geometry/paths/path";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import StrokeAlignValue from "js/pq_games/layout/values/strokeAlignValue";
import LayoutNode from "js/pq_games/layout/layoutNode";
import { FlowDir, FlowType } from "js/pq_games/layout/values/aggregators/flowInput";
import AlignValue from "js/pq_games/layout/values/alignValue";
import TwoAxisValue from "js/pq_games/layout/values/twoAxisValue";
import FourSideValue from "js/pq_games/layout/values/fourSideValue";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import bevelCorners from "js/pq_games/tools/geometry/paths/bevelCorners";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";

export default class Card
{
    type: Type; // LIFE or NUMBER
    num: number; 
    cat: string;
    suit: string;
    power: string; // reference to key in POWERS dict; not the power text itself!
    data: Record<string, any>; // data associated with POWER (might be dynamically generated in some cases)
    handLimit: number;

    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;

    constructor(type:Type, num:number)
    {
        this.type = type;
        this.num = num;
    }

    async drawForRules(cfg)
    {
        const size = cfg.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);

        // background color
        let bgColor = SUITS[this.suit].color;
        fillCanvas(ctx, bgColor);

        // the number
        await this.drawBigNumber();

        // finish it off
        this.drawOutline();

        const img = await convertCanvasToImage(this.getCanvas());
        return img;
    }

    getCanvas() { return this.ctx.canvas; }
    async draw(visualizer:Visualizer)
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);

        await this.drawBackground(visualizer);

        if(this.type == Type.LIFE) {
            await this.drawLifeCard();
        } else {
            await this.drawNumberCard();
        }

        this.drawOutline();

        return this.getCanvas();
    }

    //
    // > LIFE CARDS
    //
    async drawLifeCard()
    {
        await this.drawCatIllustration();
        await this.drawPowerText();
        await this.drawLivesHeart();
    }

    isRuleReminder()
    {
        return CONFIG.generation.numberCards.highestCardIsRuleReminder && this.num >= 9;
    }

    async drawCatIllustration()
    {
        // actual illustration
        const res = CONFIG.resLoader.getResource("cats");
        const frame = CATS[this.cat].frame;
        const dims = new Point(this.size.x * CONFIG.cards.cat.sizeFactor);
        const offset = CONFIG.cards.cat.offset.clone().scaleFactor(this.sizeUnit);
        const pos = new Point(0.5*this.size.x).move(offset);
        const alpha = this.isRuleReminder() ? CONFIG.cards.cat.rulesReminderCatAlpha : 1.0;
        const catEffects = [];
        if(CONFIG.inkFriendly) { catEffects.push(new GrayScaleEffect()); }

        const op = new LayoutOperation({
            translate: pos,
            dims: dims,
            frame: frame,
            pivot: new Point(0.5),
            alpha: alpha,
            effects: catEffects
        })
        await res.toCanvas(this.ctx, op);

        // rule reminder on top, if enabled
        if(this.isRuleReminder())
        {
            const res = CONFIG.resLoader.getResource("misc");
            op.frame = MISC.rulesReminder.frame;
            op.alpha = 1.0;
            op.dims = op.dims.clone().scaleFactor(CONFIG.cards.cat.rulesReminderScale);
            await res.toCanvas(this.ctx, op);
        }

        // two small rectangles to make transition to bottom look better
        const bottomEdge = pos.clone().move(new Point(0, 0.5*dims.y));
        const strokeWidth = CONFIG.cards.sharedStrokeWidth * this.sizeUnit;
        const extraRectHeight = CONFIG.cards.cat.extraRectHeight * this.sizeUnit;
        const posAbove = bottomEdge.clone().move(new Point(0, -0.5*extraRectHeight));
        const rectAbove = new Rectangle({ extents: new Point(this.size.x, extraRectHeight) })
        const resAbove = new ResourceShape({ shape: rectAbove });
        const opAbove = new LayoutOperation({
            translate: posAbove,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            alpha: CONFIG.cards.cat.extraRectAlpha
        })
        await resAbove.toCanvas(this.ctx, opAbove);

        const posBelow = bottomEdge.clone().move(new Point(0, 0.5*extraRectHeight));
        opAbove.translate = posBelow;
        await resAbove.toCanvas(this.ctx, opAbove);

        // the cat's name
        const fontSize = CONFIG.cards.cat.fontSize * this.sizeUnit;
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
            translate: new Point(offsetInward, pos.y),
            dims: new Point(1000, fontSize),
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: strokeWidth * CONFIG.cards.cat.strokeWidthFactor,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            rotation: -0.5*Math.PI,
            pivot: new Point(0.5),
            effects: effects
        })
        await textRes.toCanvas(this.ctx, textOp);

        textOp.rotation = 0.5*Math.PI;
        textOp.translate.x = this.size.x - offsetInward;
        await textRes.toCanvas(this.ctx, textOp);
    }

    async drawLivesHeart()
    {
        // first icon in background
        const resIcon = CONFIG.resLoader.getResource("misc");
        const frame = MISC.heart.frame;
        const yPos = CONFIG.cards.lives.yPos * this.size.y;
        const pos = new Point(0.5*this.size.x, yPos);
        const iconSize = new Point(CONFIG.cards.lives.iconSize * this.sizeUnit);
        const effects : any[] = [new DropShadowEffect({ offset: iconSize.clone().scaleFactor(0.025), color: CONFIG.cards.sharedShadowColor })];
        if(CONFIG.inkFriendly) { effects.push(new GrayScaleEffect()); }
        
        const opIcon = new LayoutOperation({
            translate: pos,
            frame: frame,
            dims: iconSize,
            pivot: new Point(0.5),
            effects: effects
        })

        await resIcon.toCanvas(this.ctx, opIcon);

        // then text on top
        const strokeWidth = CONFIG.cards.sharedStrokeWidth * this.sizeUnit;
        const fontSize = CONFIG.cards.lives.fontSize * this.sizeUnit;
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
            translate: textPos,
            dims: new Point(2*fontSize),
            pivot: new Point(0.5),
            fill: CONFIG.inkFriendly ? "#FFFFFF" : "#FFE7D5",
            stroke: CONFIG.inkFriendly ? "#111111" : "#4B0300",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            effects: effects
        })

        const res = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        await res.toCanvas(this.ctx, op);

        const sideOffset = CONFIG.cards.lives.handIconSideOffset * this.size.x;
        const topOffset = 0; // not needed anymore, right?
        const handIconPositions = 
        [
            new Point(sideOffset, pos.y + topOffset),
            new Point(this.size.x - sideOffset, pos.y + topOffset)
        ]

        for(let i = 0; i < 2; i++)
        {
            // hand limit icon
            const resHand = CONFIG.resLoader.getResource("misc");
            const handIconSize = CONFIG.cards.lives.handIconSize * this.sizeUnit;
            const pos = handIconPositions[i];
            const handOp = new LayoutOperation({
                frame: MISC.hand.frame,
                translate: pos,
                dims: new Point(handIconSize),
                pivot: Point.CENTER,
                effects: effects,
                flipX: (i == 1),
            })

            await resHand.toCanvas(this.ctx, handOp);

            // hand limit number
            const limit = CONFIG.generation.lifeCards.handLimits[this.num-1];
            const fontSize = CONFIG.cards.lives.handIconFontSize * this.sizeUnit;
            textConfig.size = fontSize;
            const moveDir = i == 0 ? 1 : -1;
            const resHandText = new ResourceText({ text: limit.toString(), textConfig: textConfig });
            const handTextOp = new LayoutOperation({
                translate: pos.clone().move(new Point(moveDir * 0.5 * fontSize, 0)),
                dims: new Point(this.size.x, fontSize),
                pivot: Point.CENTER,
                fill: CONFIG.inkFriendly ? "#ECECEC" : "#B3FFFE",
                stroke: CONFIG.inkFriendly ? "#323232" : "#003938",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlignValue.OUTSIDE
            })
            await resHandText.toCanvas(this.ctx, handTextOp);
        }
        
    }

    async drawPowerText()
    {
        if(this.isRuleReminder() || !this.power) { return; }

        const fontSize = CONFIG.cards.power.fontSize * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE
        })

        // some small vector magic to create a rectangle with the corners cut/beveled
        const yPos = CONFIG.cards.power.yPos * this.size.y;
        const pos = new Point(0.5*this.size.x, yPos);
        const rectSize = CONFIG.cards.power.rectSize.clone().scale(this.size);
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

        const strokeWidth = CONFIG.cards.sharedStrokeWidth * this.sizeUnit;
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
        await resShape.toCanvas(this.ctx, opRect);

        // then put the actual text inside it
        const root = new LayoutNode({
            size: this.size
        })

        const textContainer = new LayoutNode({
            pos: new Point(0.5*(this.size.x-rectSize.x), pos.y-0.5*rectSize.y),
            size: rectSize,
            padding: new FourSideValue(0.5*fontSize),
            flow: FlowType.GRID,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE,
            alignStack: AlignValue.MIDDLE,
            alignContent: AlignValue.MIDDLE,
            wrap: true
        })
        root.addChild(textContainer);

        let desc = this.data.desc.split(" ");
        const suitNames = Object.keys(SUITS);
        const marginVal = new FourSideValue(0, 0.25*fontSize, 0, 0);
        for(const word of desc)
        {
            const isIcon = suitNames.includes(word);

            if(isIcon) {
                const res = (CONFIG.resLoader.getResource("suits") as ResourceImage).getImageFrameAsResource(SUITS[word].frame);
                const iconNode = new LayoutNode({
                    resource: res,
                    size: new Point(1.5*fontSize),
                    margin: marginVal,
                    shrink: 0
                })
                textContainer.addChild(iconNode);
            } else {
                const resText = new ResourceText({ text: word, textConfig: textConfig });
                const textNode = new LayoutNode({
                    resource: resText,
                    size: new TwoAxisValue().setAuto(),
                    fill: "#000000",
                    margin: marginVal
                })
                textContainer.addChild(textNode);
            }
        }

        await root.toCanvas(this.ctx);

    }

    //
    // > NUMBER cards 
    //
    async drawNumberCard()
    {
        await this.drawNumbers();
        await this.drawSuits();
        await this.drawMainPart();
    }

    async drawBigNumber()
    {
        // the number
        const fontSize = CONFIG.cards.numbers.fontSizeBig * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })

        const strokeWidth = CONFIG.cards.sharedStrokeWidth * this.sizeUnit;
        const shadowOffset = new Point(CONFIG.cards.sharedShadowOffset * this.sizeUnit);
        const effects = [new DropShadowEffect({ offset: shadowOffset, color: CONFIG.cards.sharedShadowColor })];
        const iconSize = CONFIG.cards.suits.bigSuitSize * this.sizeUnit
        const center = this.size.clone().scale(0.5);

        const op = new LayoutOperation({
            dims: new Point(iconSize*3), // @TODO: if no dims given, just make dims "whatever needed"?
            translate: center,
            pivot: new Point(0.5),
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            effects: effects
        })

        const res = new ResourceText({ text: this.num.toString(), textConfig: textConfig });
        await res.toCanvas(this.ctx, op);

        return op;
    }

    async drawMainPart()
    {
        const center = this.size.clone().scaleFactor(0.5);

        // the abstract suit icon behind it
        const resIcon = CONFIG.resLoader.getResource("suits");
        const frame = this.data.frame + 1;
        const iconSize = CONFIG.cards.suits.bigSuitSize * this.sizeUnit
        const opIcon = new LayoutOperation({
            frame: frame,
            translate: center,
            dims: new Point(iconSize),
            pivot: new Point(0.5),
            alpha: CONFIG.cards.suits.bigSuitAlpha
        })

        await resIcon.toCanvas(this.ctx, opIcon);

        const op = await this.drawBigNumber();

        const is6or9 = (this.num == 6 || this.num == 9);
        const needsLine = is6or9
        if(!needsLine) { return; }

        const fontSize = CONFIG.cards.numbers.fontSizeBig * this.sizeUnit;
        const lineCenter = center.clone().move(new Point(0, CONFIG.cards.numbers.clarityLineOffsetY*fontSize));
        const lineExtents = CONFIG.cards.numbers.clarityLineSize.clone().scale(fontSize);
        const rect = new Rectangle({ center: lineCenter, extents: lineExtents });
        const bevelSize = CONFIG.cards.numbers.clarityLineBevel * Math.min(lineExtents.x, lineExtents.y);
        const path = bevelCorners(rect.toPath(), bevelSize);
        const pathObj = new Path({ points: path, close: true });
        const resLine = new ResourceShape({ shape: pathObj });

        op.translate = new Point();
        op.dims = new Point();
        op.pivot = new Point();
        await resLine.toCanvas(this.ctx, op);
        
    }

    async drawNumbers()
    {
        const edges = [
            new Point(0.5*this.size.x, 0),
            new Point(this.size.x, 0.5*this.size.y),
            new Point(0.5*this.size.x, this.size.y),
            new Point(0, 0.5*this.size.y)
        ]

        const offsets = [
            Point.DOWN,
            Point.LEFT,
            Point.UP,
            Point.RIGHT
        ]

        const fontSize = CONFIG.cards.numbers.fontSize * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const textOffset = CONFIG.cards.numbers.offsetFromEdge * fontSize;
        const strokeWidth = CONFIG.cards.sharedStrokeWidth * this.sizeUnit;

        for(let i = 0; i < edges.length; i++)
        {
            let text = this.num.toString();

            const rot = (i <= 1) ? 0 : Math.PI;
            const res = new ResourceText({ text: text, textConfig: textConfig });
            const pos = edges[i].clone().move(offsets[i].clone().scaleFactor(textOffset));
            const op = new LayoutOperation({
                dims: new Point(4*fontSize, fontSize),
                translate: pos,
                pivot: new Point(0.5),
                fill: "#FFFFFF",
                stroke: "#000000",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlignValue.OUTSIDE,
                rotation: rot
            });
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawSuits()
    {
        const corners = [
            new Point(),
            new Point(this.size.x, 0),
            this.size.clone(),
            new Point(0, this.size.y)
        ]

        const offsets = [
            new Point(1,1),
            new Point(-1,1),
            new Point(-1,-1),
            new Point(1,-1)
        ]

        const offset = CONFIG.cards.suits.offset.clone().scaleFactor(this.sizeUnit);
        const iconSize = new Point(CONFIG.cards.suits.iconSize * this.sizeUnit);
        const frame = this.data.frame;
        const res = CONFIG.resLoader.getResource("suits");
        const effects : any[] = [
            new DropShadowEffect({ offset: iconSize.clone().scaleFactor(0.1), color: CONFIG.cards.sharedShadowColor }),
        ];
        if(CONFIG.inkFriendly) { effects.push(new GrayScaleEffect()); }

        for(let i = 0; i < corners.length; i++)
        {
            const pos = corners[i].clone().move(offsets[i].clone().scale(offset));
            const rot = i <= 1 ? 0 : Math.PI;
            const op = new LayoutOperation({
                frame: frame,
                dims: iconSize,
                translate: pos,
                pivot: new Point(0.5),
                rotation: rot,
                effects: effects
            })
            await res.toCanvas(this.ctx, op);
        }
    }

    //
    // > SHARED
    //
    async drawBackground(vis:Visualizer)
    {
        let color = this.data.color;
        if(this.type == Type.LIFE) { color = CATS[this.cat].color; }
        if(CONFIG.inkFriendly) { color = "#FFFFFF"; }

        let alpha = CONFIG.cards.bgCats.patternAlpha;
        if(CONFIG.inkFriendly) { alpha *= 0.5; }

        fillCanvas(this.ctx, color);

        const center = this.size.clone().scaleFactor(0.5);
        const op = new LayoutOperation({
            translate: center,
            alpha: alpha,
            rotation: CONFIG.cards.bgCats.patternRotation,
            pivot: new Point(0.5)
        })
        await vis.patternCat.toCanvas(this.ctx, op);
    }

    drawOutline()
    {
        const outlineSize = CONFIG.cards.outline.size * this.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}