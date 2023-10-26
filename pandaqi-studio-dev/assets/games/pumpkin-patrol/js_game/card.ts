import createContext from "js/pq_games/layout/canvas/createContext";
import { COLORS, MISC, SET_ORDER, Type } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Point from "js/pq_games/tools/geometry/point";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import SideData from "./sideData";
import ResourceGradient, { GradientType } from "js/pq_games/layout/resources/resourceGradient";
import ColorStop from "js/pq_games/layout/color/colorStop";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Color from "js/pq_games/layout/color/color";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutNode from "js/pq_games/layout/layoutNode";
import TwoAxisValue from "js/pq_games/layout/values/twoAxisValue";
import Path from "js/pq_games/tools/geometry/paths/path";
import { FlowDir, FlowType } from "js/pq_games/layout/values/aggregators/flowInput";
import AlignValue from "js/pq_games/layout/values/alignValue";
import movePath from "js/pq_games/tools/geometry/transform/movePath";
import Line from "js/pq_games/tools/geometry/line";
import RequirementData from "./requirementData";
import FourSideValue from "js/pq_games/layout/values/fourSideValue";

export default class Card
{
    type: Type; // PERSON or HAND
    person: string;
    score: number; // for a person card, their score
    decorations: RequirementData; // for a person card, the decoration requirements
    treats: RequirementData; // for a person card, the treat requirements
    sides: SideData[]; // for a hand card, top (0) and bottom (1)

    ctx: CanvasRenderingContext2D;
    size: Point;
    sizeUnit: number;
    colorMain: string;
    rootNode: LayoutNode;

    constructor(type:Type)
    {
        this.type = type;
        this.score = 0;
        this.decorations = null;
        this.treats = null;
        this.sides = [];
        this.person = null;
    }

    setScore(n) { this.score = n; }
    setDecorations(d) { this.decorations = d; }
    setTreats(t) { this.treats = t; }
    setSides(a,b) { this.sides = [a,b]; }
    setPerson(p) { this.person = p; }

    async drawForRules(cfg)
    {
        // @TODO
    }

    getData()
    {
        if(this.person) { return CONFIG.allCards[this.person]; }
        if(this.sides.length > 0) {
            const typeA = this.sides[0].type;
            const typeB = this.sides[1].type;
            if(typeA != CONFIG.generation.wildcardKey) { return CONFIG.allCards[typeA]; }
            if(typeB != CONFIG.generation.wildcardKey) { return CONFIG.allCards[typeB]; }
            return CONFIG.generation.wildcardData;
        }
        return null;
    }

    getDataFromSideData(sd:SideData)
    {
        if(sd.type == CONFIG.generation.wildcardKey) { return CONFIG.generation.wildcardData; }
        return CONFIG.allCards[sd.type]
    }

    getCanvas() { return this.ctx.canvas; }
    async draw()
    {
        const size = CONFIG.cards.size;
        const ctx = createContext({ size: size });
        this.ctx = ctx;
        this.size = size;
        this.sizeUnit = Math.min(size.x, size.y);

        if(this.type == Type.PERSON) {
            await this.drawPerson();
        } else {
            await this.drawHandCard();
        }

        this.drawOutline();

        return this.getCanvas();
    }

    //
    // > PERSON CARDS
    //
    async drawPerson()
    {
        await this.drawPersonBackground();
        await this.drawPersonIllustration();
        await this.drawPersonDetails();
    }

    async drawPersonBackground()
    {
        // purple background (whole card)
        const bgColor = CONFIG.cards.bgPerson.color;
        fillCanvas(this.ctx, bgColor);

        // gradient (top block)
        const size = new Point(this.size.x, this.size.y * CONFIG.cards.bgPerson.size);
        const midPoint = size.clone().scaleFactor(0.5);
        const res = new ResourceGradient({ 
            type: GradientType.RADIAL, 
            start: midPoint, end: midPoint, 
            startRadius: 0, endRadius: Math.min(size.x, size.y)*0.5 
        }); // @TODO: add convenience function to "scale" the whole thing to a size?
        res.addStop(new ColorStop({ pos: 0, color: new Color(0,0,0,0) }));
        res.addStop(new ColorStop({ pos: 1, color: new Color(0,0,0,0.5) }));

        const op = new LayoutOperation({
            translate: midPoint.clone(),
            dims: size,
            pivot: new Point(0.5)
        })
        await res.toCanvas(this.ctx, op);

        // beam of light (top block)
        const beam = CONFIG.resLoader.getResource("misc");
        const frame = MISC.beam.frame;
        const beamScale = CONFIG.cards.bgPerson.beamScale;
        const beamSize = size.clone().scaleFactor(beamScale)
        const scoreOffset = CONFIG.cards.score.offset * this.size.y* CONFIG.cards.bgPerson.beamOffsetY;
        const beamPos = midPoint.clone().move(new Point(0,scoreOffset));
        const beamOp = new LayoutOperation({
            translate: beamPos,
            dims: beamSize,
            pivot: new Point(0.5),
            frame: frame,
        })
        await beam.toCanvas(this.ctx, beamOp);
    }

    async drawPersonIllustration()
    {
        // draw main illustration (on top of light beam)
        const data = this.getData();
        const textureKey = data.textureKey;
        const res = CONFIG.resLoader.getResource(textureKey);
        const topBlockEnd = this.size.y * CONFIG.cards.bgPerson.size;
        const iconSize = topBlockEnd * CONFIG.cards.illustrationPerson.size;
        const iconOffsetY = CONFIG.cards.illustrationPerson.offsetY * topBlockEnd;
        const anchor = new Point(0.5*this.size.x, topBlockEnd);
        const op = new LayoutOperation({
            frame: data.frame,
            translate: anchor.clone().move(new Point(0, iconOffsetY)),
            dims: new Point(iconSize),
            pivot: new Point(0.5, 1)
        })
        await res.toCanvas(this.ctx, op);

        // draw score star + score text
        const resStar = CONFIG.resLoader.getResource("misc");
        const starFrame = MISC.score.frame;
        const starOffset = new Point(0.5*this.size.x, CONFIG.cards.score.offset * this.size.y);
        const starDims = CONFIG.cards.score.dims * this.sizeUnit;
        const shadowBlur = CONFIG.cards.score.shadowSize * starDims;
        const starOp = new LayoutOperation({ 
            frame: starFrame,
            translate: starOffset,
            dims: new Point(starDims),
            pivot: new Point(0.5),
            effects: [
                new DropShadowEffect({ blurRadius: shadowBlur })
            ]
        })
        await resStar.toCanvas(this.ctx, starOp);

        // @TODO: TextDrawer goes into infinite loop if text doesn't fit inside boundaries! FIX THAT
        let fontSizeScore = CONFIG.cards.score.textSize * this.sizeUnit;
        const doubleDigits = this.score >= 10;
        if(doubleDigits) { fontSizeScore *= CONFIG.cards.score.doubleDigitShrinkFactor; }

        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSizeScore,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        });
        const starTextOp = new LayoutOperation({
            fill: CONFIG.cards.score.textColor,
            translate: starOffset.clone().move(new Point(0, 0.1*fontSizeScore)), // tiny offset just because it looks better inside star
            dims: new Point(starDims),
            pivot: new Point(0.5)
        })

        const scoreRes = new ResourceText({ text: this.score.toString(), textConfig: textConfig });
        await scoreRes.toCanvas(this.ctx, starTextOp);

        // draw person name left + right (rotated, white)
        const fontSizeName = CONFIG.cards.namePerson.size * this.sizeUnit;
        textConfig.size = fontSizeName;
        const textOffset = fontSizeName;
        const positions = [
            new Point(textOffset, 0.5*topBlockEnd),
            new Point(this.size.x - textOffset, 0.5*topBlockEnd)
        ];

        const rotations = [
            0.5*Math.PI,
            -0.5*Math.PI
        ]

        const name = this.person;
        const textAlpha = CONFIG.cards.namePerson.alpha;
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const rot = rotations[i];
            const res = new ResourceText({ text: name, textConfig: textConfig });
            const op = new LayoutOperation({
                fill: CONFIG.cards.namePerson.color,
                translate: pos,
                dims: new Point(this.size.x, fontSizeName), // @TODO: should really do auto-infinite-dim for text if not supplied
                rotation: rot,
                alpha: textAlpha,
                pivot: new Point(0.5)
            })
            await res.toCanvas(this.ctx, op);
        }

        await this.drawSetID();
    }

    async drawPersonDetails()
    {
        this.rootNode = new LayoutNode({
            size: this.size.clone()
        })

        // draw purple background (underneath main illustration, all the way to bottom)
        const anchorY = CONFIG.cards.bgPerson.size * this.size.y;
        this.ctx.save();
        this.ctx.fillStyle = CONFIG.cards.details.bgs.power;
        this.ctx.fillRect(0, anchorY, this.size.x, this.size.y);
        this.ctx.restore();

        // determine values for wonky rectangles
        const powerRectFraction = CONFIG.cards.details.powerRectFraction;
        const powerRectHeight = (this.size.y - anchorY) * powerRectFraction;
        const baseRectHeight = ((this.size.y - anchorY) - powerRectHeight) * 0.5; // *0.5 because split over two things (decos + treats)
        const baseRectSize = new Point(this.size.x, baseRectHeight);
        const shadowBlur = CONFIG.cards.details.rectShadowSize * this.sizeUnit;
        const rectEffects = [
            new DropShadowEffect({ blurRadius: shadowBlur })
        ]

        const elongation = CONFIG.cards.details.wonkyRectElongation * this.sizeUnit;

        // > TREAT FIRST (treat icon right + requirements middle) (comes first for correct overlap + shadow)        
        await this.drawDetailsRectangle(anchorY + baseRectSize.y + elongation, baseRectSize, rectEffects, "right", "treats");

        // > DECORATION second (flipped horizontally, otherwise identical)
        await this.drawDetailsRectangle(anchorY, baseRectSize, rectEffects, "left", "decorations")

        // draw the power data at the bottom
        // (just a faded tagline if no power, otherwise heart icon + strong power text)
        // @TODO: might need to switch this to LayoutNode system in the future ...
        const data = this.getData();
        const hasPower = data.power; 
        const desc = data.desc ?? "This is a placeholder tagline.";
        const textColor = CONFIG.cards.details.power.textColor;
        const powerMidY = this.size.y - 0.5*powerRectHeight + elongation;
        const powerMaxWidth = CONFIG.cards.details.power.textMaxWidth*this.size.x;
        let alpha = 1.0;
        let fontSize = 20.0;

        if(!hasPower) {
            fontSize = CONFIG.cards.details.power.fontSizeNoPower * this.sizeUnit;
            alpha = CONFIG.cards.details.power.alphaNoPower;
        } else {
            fontSize = CONFIG.cards.details.power.fontSize * this.sizeUnit;
            await this.drawDetailsIcon(powerMidY, CONFIG.cards.details.iconHeight*baseRectSize.y, "left", "power");
        }
        
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            fontSize: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        });

        const resText = new ResourceText({ text: desc, textConfig });
        const op = new LayoutOperation({
            translate: new Point(0.5*this.size.x, powerMidY),
            dims: new Point(powerMaxWidth, powerRectHeight),
            fill: textColor,
            pivot: new Point(0.5),
            alpha: alpha
        })
        await resText.toCanvas(this.ctx, op);

        // finally, place all the stuff generated through the layout system on the canvas
        await this.rootNode.toCanvas(this.ctx);
    }

    async drawDetailsRectangle(anchorY: number, size:Point, effs, side:string, prop:string)
    {
        // background rect shape
        const rect = this.getWonkyRectangle(size, side);
        const res = new ResourceShape({ shape: rect });
        const op = new LayoutOperation({
            translate: new Point(0, anchorY),
            fill: CONFIG.cards.details.bgs[prop],
            effects: effs
        })
        await res.toCanvas(this.ctx, op);

        // type icon
        const iconY = op.translate.y + 0.5*size.y;
        const iconSize = CONFIG.cards.details.iconHeight*size.y;
        await this.drawDetailsIcon(iconY, iconSize, side, prop);

        // actual content
        const content = this[prop];
        content.sort(); // sort by type, looks cleaner than random order

        const containerNode = new LayoutNode({
            pos: op.translate,
            size: new TwoAxisValue(size.x, size.y),
            flow: FlowType.GRID,
            dir: FlowDir.HORIZONTAL,
            alignFlow: AlignValue.MIDDLE,
            alignStack: AlignValue.MIDDLE,
        })
        this.rootNode.addChild(containerNode);

        // @TODO: display different special requirements
        const imageHeight = 0.8*size.y;
        const imageSize = new TwoAxisValue(imageHeight, imageHeight);
        const iconEffects = [ new DropShadowEffect({ blurRadius: CONFIG.cards.details.iconShadowSize*imageHeight }) ];

        if(content.atMost)
        {
            const fontSize = CONFIG.cards.details.rectTextFontSize * imageHeight;
            const textConfig = new TextConfig({
                font: CONFIG.fonts.heading,
                size: fontSize,
            });

            const color = CONFIG.cards.details.rectTextColor;
            const text = new ResourceText({ text: "at most", textConfig: textConfig });
            const node = new LayoutNode({
                fill: color,
                resource: text,
                size: new TwoAxisValue().setAuto(),
                shrink: 0,
                padding: new FourSideValue(0, 0.25*fontSize, 0, 0)
            })
            containerNode.addChild(node);
        }

        for(const elem of content.get())
        {
            const data = CONFIG.allCards[elem];
            const specialType = !data;
            const isWildcard = (elem == CONFIG.generation.wildcardKey);
            const resKey = (isWildcard || specialType) ? "misc" : data.textureKey;
            
            let frame = 0;
            if(isWildcard) { frame = MISC.wildcard.frame; }
            else if(specialType) { frame = MISC[elem].frame; }
            else { frame = data.frame; }

            const res = CONFIG.resLoader.getResource(resKey).getImageFrameAsResource(frame);

            const node = new LayoutNode({
                resource: res,
                size: imageSize,
                shrink: 0,
                effects: iconEffects
            })
            containerNode.addChild(node);
        }
    }

    async drawDetailsIcon(y:number, iconSize:number, side:string, prop:string)
    {
        // type icon
        const icon = CONFIG.resLoader.getResource("misc");
        const iconFrame = MISC[prop].frame;
        const iconOffset = CONFIG.cards.details.iconOffset * this.sizeUnit;
        const iconX = side == "left" ? iconOffset : (this.size.x - iconOffset);
        const col = new Color(CONFIG.cards.details.bgs[prop]).darken(50);
        const iconEffects = [ new TintEffect({ color: col }) ];
        const iconOp = new LayoutOperation({
            frame: iconFrame,
            translate: new Point(iconX, y),
            dims: new Point(iconSize),
            pivot: new Point(0.5),
            effects: iconEffects
        });
        await icon.toCanvas(this.ctx, iconOp);
    }

    getWonkyRectangle(size:Point, side:string)
    {
        // just create a rectangle
        const path = [
            new Point(),
            new Point(size.x, 0),
            new Point(size.x, size.y),
            new Point(0, size.y)
        ]

        // then elongate the given side
        const distance = CONFIG.cards.details.wonkyRectElongation * this.sizeUnit;
        const vectors = [ new Point(0,1), new Point(0,-1) ];
        let points = [ path[3], path[0] ];
        if(side == "right") { points = [ path[2], path[1] ]; }

        for(let i = 0; i < 2; i++)
        {
            points[i].move(vectors[i].scaleFactor(distance));
        }

        return new Path({ points: path });
    }

    //
    // > HAND cards 
    //
    async drawHandCard()
    {
        // draw the two sides independently, one simply rotated by PI
        await this.drawHandSide("top");
        await this.drawHandSide("bottom");

        await this.drawSetID();
    }

    async drawHandSide(side:string)
    {
        const sideData = this.sides[side == "top" ? 0 : 1];
        const rot = (side == "top") ? 0 : Math.PI;

        const data = this.getDataFromSideData(sideData);
        const subType = sideData.subType;
        const color = COLORS[data.color];

        // draw wonky rectangle background
        const halfHeight = 0.5*this.size.y;
        const rectSize = new Point(this.size.x, halfHeight);
        const midPoint = rectSize.clone().scaleFactor(0.5);
        let rect = [
            new Point(),
            new Point(this.size.x, 0),
            new Point(this.size.x, halfHeight),
            new Point(0, halfHeight)
        ]

        const bottomSideOffset = new Point(0, halfHeight);
        if(side == "bottom") { 
            rect = movePath(rect, bottomSideOffset); 
            midPoint.move(bottomSideOffset);
        }

        // elongate one side, shrink the other
        // (flipped for bottom side)
        const elongation = CONFIG.cards.bgHand.rectElongationFactor * halfHeight;
        const vectors = [new Point(0,1).scaleFactor(elongation), new Point(0,-1).scaleFactor(elongation)];
        let points = [ rect[3], rect[2] ];
        if(side == "bottom") { points = [ rect[0], rect[1] ]; }
        for(let i = 0; i < points.length; i++)
        {
            points[i].move(vectors[i]);
        }

        // (dynamically calculate exactly how slanted it is)
        const slantedLine = new Line(new Point(0, vectors[0].y), new Point(rectSize.x, vectors[1].y));
        const ang = slantedLine.angle();

        const bgShape = new Path({ points: rect });
        const op = new LayoutOperation({
            fill: color
        })
        const bgRes = new ResourceShape({ shape: bgShape });
        await bgRes.toCanvas(this.ctx, op);

        // draw icon pattern
        this.ctx.save();
        this.ctx.clip(bgShape.toPath2D());

        const patternRes = CONFIG.cards.patterns[subType];
        const patternAlpha = CONFIG.cards.bgHand.patternAlpha;
        const patternRot = rot + ang;
        const patternOp = new LayoutOperation({
            translate: midPoint,
            dims: new Point(this.size.x * CONFIG.cards.bgHand.patternExtraMargin),
            rotation: patternRot,
            alpha: patternAlpha,
            pivot: new Point(0.5)
        })
        await patternRes.toCanvas(this.ctx, patternOp);
        
        this.ctx.restore();

        // draw a line to reinforce the split ( + make the transition a little nicer)
        const resLine = new ResourceShape({ shape: slantedLine });
        const lineOp = new LayoutOperation({
            translate: new Point(0, halfHeight),
            strokeWidth: CONFIG.cards.bgHand.slantedLineWidth * this.sizeUnit,
            stroke: CONFIG.cards.bgHand.slantedLineColor
        })
        await resLine.toCanvas(this.ctx, lineOp);

        // draw actual icons (resized and changed position to fit their number)
        let positions = [];
        const numIcons = sideData.number;
        const resizeFactor = numIcons <= 1 ? 1 : Math.pow(2, 1.0/numIcons);
        const iconSize = (CONFIG.cards.handSide.iconScale * halfHeight) / resizeFactor;
        const iconOffset = new Point(-0.5*(numIcons-1)*iconSize, 0);

        const iconAnchor = midPoint.clone().move(iconOffset);

        for(let i = 0; i < numIcons; i++)
        {
            const pos = iconAnchor;
            positions.push(pos.clone());
            iconAnchor.move(new Point(iconSize, 0));
        }

        const shadowBlur = CONFIG.cards.handSide.shadowSize * iconSize;
        const effects = [new DropShadowEffect({ blurRadius: shadowBlur })];
        const res = CONFIG.resLoader.getResource(data.textureKey);
        for(const pos of positions)
        {
            const op = new LayoutOperation({
                frame: data.frame,
                translate: pos,
                dims: new Point(iconSize),
                rotation: rot,
                pivot: new Point(0.5),
                effects: effects
            })
            await res.toCanvas(this.ctx, op);
        }

        // add text for type along slanted line
        const fontSize = CONFIG.cards.bgHand.fontSize * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE
        })
        const textOffset = CONFIG.cards.bgHand.textOffsetFromLine * fontSize;
        const textPos = (side == "top") ? new Point(midPoint.x, halfHeight - textOffset) : new Point(midPoint.x, halfHeight + textOffset);
        const col = CONFIG.cards.bgHand.textColor;
        const textOp = new LayoutOperation({
            fill: col,
            translate: textPos,
            dims: new Point(this.size.x, fontSize),
            rotation: patternRot,
            effects: [ new DropShadowEffect({ blurRadius: CONFIG.cards.bgHand.textShadow * fontSize })],
            pivot: new Point(0.5)
        })
        const textToDisplay = subType.toLowerCase();
        const textRes = new ResourceText({ text: textToDisplay, textConfig: textConfig });
        await textRes.toCanvas(this.ctx, textOp);
    }

    // shared functions for both card types below
    async drawSetID()
    {
        // @TODO: this seems to break when I set alignHorizontal to anything else???
        const fontSizeID = CONFIG.cards.setID.size * this.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSizeID,
            alignHorizontal: TextAlign.MIDDLE,
            alignVertical: TextAlign.MIDDLE,
        });

        // draw set ID in top left (use SET_ORDER from dict, convert to roman numerals)
        const offset = CONFIG.cards.setID.offset.clone().scaleFactor(this.sizeUnit);
        const ID = CONFIG.seed;
        const op = new LayoutOperation({
            fill: CONFIG.cards.setID.color,
            translate: offset,
            dims: new Point(0.15*this.size.x, fontSizeID),
            alpha: CONFIG.cards.setID.alpha,
            pivot: new Point(0.5)
        })

        const resID = new ResourceText({ text: ID, textConfig: textConfig });
        await resID.toCanvas(this.ctx, op);
    }

    drawOutline()
    {
        const outlineSize = CONFIG.cards.outline.size * this.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.cards.outline.color, outlineSize);
    }
}