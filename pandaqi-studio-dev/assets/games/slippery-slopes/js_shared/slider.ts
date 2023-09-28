import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "./config";
import equidistantColorsBetweenOpposites from "../js_game/tools/equidistantColorsBetweenOpposites";
import createWavyRect from "../js_game/tools/createWavyRect";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import { ACTIONS, PROPERTIES, RANDOM_SHAPE_LIST, SLIDERS } from "./dict";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import Color from "js/pq_games/layout/color/color";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import range from "js/pq_games/tools/random/range";
import Path from "js/pq_games/tools/geometry/paths/path";
import createRandomShape from "js/pq_games/tools/geometry/random/createRandomShape";
import scalePath from "js/pq_games/tools/geometry/transform/scalePath";
import drawRectangle from "js/pq_games/layout/canvas/shapes/drawRectangle";
import Dims from "js/pq_games/tools/geometry/dims";
import fitPath from "js/pq_games/tools/geometry/paths/fitPath";
import RectangleRounded from "js/pq_games/tools/geometry/rectangleRounded";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class Slider
{
    mainType:string
    subType:string
    actions: string[]
    meterRect: Rectangle
    wavyRect: ResourceShape;

    constructor(mt:string = "property", st:string = "", ac:string[] = [])
    {
        this.mainType = mt;
        this.subType = st;
        this.actions = ac;
    }

    reload()
    {
        this.mainType = "property";
        this.subType = getWeighted(PROPERTIES);
    }

    async draw(customSize:Point = null)
    {
        const colorSteps = CONFIG.sliderCards.numColorSteps;

        const cardSize = customSize ?? CONFIG.sliderCards.size;
        const ctx = createContext({ size: cardSize });
        const blockHeight = cardSize.y / colorSteps;
        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        
        const wavyRectSize = new Point(cardSize.x, blockHeight + 4*amp);
        this.wavyRect = createWavyRect(wavyRectSize, amp, CONFIG.wavyRect.frequency, CONFIG.wavyRect.stepSize);

        const textConfig = CONFIG.cards.textConfig;
        textConfig.size = CONFIG.sliderCards.textScale * blockHeight;

        // @TODO: put wavy rect and saturation/lightness into config, so it's consistent between word and slider cards
        const saturation = CONFIG.inkFriendly ? 0 : CONFIG.wavyRect.saturation;
        const colors = equidistantColorsBetweenOpposites(colorSteps, saturation, CONFIG.wavyRect.lightness);

        this.createOutlineRect(ctx, cardSize);
        ctx.clip();

        await this.drawBackground(ctx, colors, blockHeight, cardSize);
        await this.drawCustom(ctx, colors, textConfig, blockHeight, cardSize);
        await this.drawActionIcons(ctx, colors, blockHeight, cardSize);

        this.drawOutline(ctx, cardSize);
        
        return ctx.canvas;
    }

    createOutlineRect(ctx, cardSize)
    {
        const lw = CONFIG.cards.outline.width * cardSize.x;
        const radius = CONFIG.cards.outline.radius * cardSize.x;

        ctx.roundRect(0.5*lw, 0.5*lw, ctx.canvas.width-lw, ctx.canvas.height-lw, radius);
    }

    drawOutline(ctx, cardSize)
    {
        const lw = CONFIG.cards.outline.width * cardSize.x;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = CONFIG.cards.outline.color;
        ctx.lineWidth = lw;
        this.createOutlineRect(ctx, cardSize);
        ctx.stroke();
        ctx.restore();
    }

    async drawBackground(ctx, colors, blockHeight, cardSize)
    {
        // draw all color steps
        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        for(let a = 0; a < colors.length; a++)
        {
            const color = colors[a];
            const topOffset = a == 0 ? -2*amp : 0;
            const canvOp = new LayoutOperation({
                translate: new Point(0, blockHeight*a + topOffset),
                fill: color,
                stroke: "#000000",
                strokeWidth: 1,
            });
            await this.wavyRect.toCanvas(ctx, canvOp);
        }

        const needsMeter = this.getMainData().needsMeter;

        // draw the meter
        if(needsMeter)
        {
            const mdata = CONFIG.sliderCards.meter;
            const center = cardSize.clone().scaleFactor(0.5);
            const originalMeterExtents = mdata.extents;
            const extents = cardSize.clone().scale(originalMeterExtents);

            // the actual meter
            const radius = mdata.borderRadius * cardSize.x;
            this.meterRect = new RectangleRounded({ center: center, extents: extents, radius: radius });
            const meterBG = mdata.backgroundColor;
            const canvOp = new LayoutOperation({
                fill: meterBG,
                stroke: "#000000",
                strokeWidth: mdata.lineWidth * cardSize.x
            });
            const res = new ResourceShape({ shape: this.meterRect });
            await res.toCanvas(ctx, canvOp);

            // tiny lines of a grid for more precision/decoration
            const numLines = 32;
            const lineParams = { fill: "#000000", alpha: 0.35 }
            const distBetweenLines = extents.y / numLines;
            const lineHeight = distBetweenLines * 0.1;
            const lineExtents = new Point(0.8 * extents.x, lineHeight)
            const linePos = new Point(center.x, center.y - 0.5*extents.y);
            for(let i = 0; i < numLines; i++)
            {
                await drawRectangle(ctx, { center: linePos, extents: lineExtents }, lineParams);
                linePos.y += distBetweenLines;
            }
        }
    }

    async drawCustom(ctx, colors, textConfig, blockHeight, cardSize)
    {
        if(this.mainType == "property") { await this.drawProperties(ctx, colors, textConfig, blockHeight, cardSize); }
        else if(this.mainType == "words") { await this.drawWords(ctx, colors, blockHeight, cardSize); }
        else if(this.mainType == "color") { await this.drawColorRamp(ctx); }
        else if(this.mainType == "shapes") { await this.drawShapes(ctx, colors, blockHeight, cardSize); }
    }

    // draw text with extremes
    async drawProperties(ctx, colors:Color[], textConfig, blockHeight, cardSize)
    {
        const textDarken = CONFIG.cards.textDarkenFactor;
        const extremes = this.getExtremes();
        for(let i = 0; i < extremes.length; i++)
        {
            const color = (i == 0) ? colors[0] : colors[colors.length-1];
            const finalColor = color.getHighestContrast([color.darken(textDarken), Color.WHITE]);

            const word = extremes[i];
            const text = new ResourceText({ text: word, textConfig: textConfig })

            const translate = (i == 0) ? new Point() : new Point(0, cardSize.y - blockHeight)
            const canvOp = new LayoutOperation({
                translate: translate,
                fill: finalColor,
                dims: new Point(cardSize.x, blockHeight)
            })
            await text.toCanvas(ctx, canvOp);
        }
    }

    // draw random words/letters in random fonts
    async drawWords(ctx, colors, blockHeight, cardSize)
    {
        const textDarken = CONFIG.cards.textDarkenFactor;
        const fonts = []; // @TODO: select random fonts (no duplicates)
        for(let i = 0; i < CONFIG.numSpecialFonts; i++)
        {
            fonts.push(i);
        }
        shuffle(fonts);

        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        for(let i = 0; i < colors.length; i++)
        {
            const fontKey =  CONFIG.fonts["special" + fonts.pop()].key;
            const tempTextCfg = new TextConfig({
                font: fontKey,
                size: 0.5*blockHeight,
                alignHorizontal: TextAlign.MIDDLE,
                alignVertical: TextAlign.MIDDLE
            })

            // @EXCEPTION: this is an abnormally large font by default
            if(fontKey == "AnuDaw") { tempTextCfg.size *= 0.5; }

            const color = colors[i];
            const finalColor = color.getHighestContrast([color.darken(textDarken), Color.WHITE]);

            const word = this.getRandomWord();

            const translate = new Point(0, i * blockHeight - 0.5*amp);
            const res = new ResourceText({ text: word, textConfig: tempTextCfg })
            const canvOp = new LayoutOperation({
                translate: translate,
                fill: finalColor,
                dims: new Point(cardSize.x, blockHeight)
            })
            await res.toCanvas(ctx, canvOp);
        }
    }

    getRandomWord()
    {
        const useRealWord = Math.random() <= CONFIG.sliderCards.words.useRealWordProb;
        if(useRealWord) 
        { 
            const realWord = CONFIG.pandaqiWords.getRandom(true).getWord(); 
            return realWord;
        }

        const randLength = rangeInteger(CONFIG.sliderCards.words.stringLengthBounds);
        const arr = [];
        for(let i = 0; i < randLength; i++)
        {
            arr.push(this.getRandomLetter());
        }
        return arr.join("");
    }

    getRandomLetter()
    {
        return String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }

    // just draw the full color wheel from top to bottom
    async drawColorRamp(ctx)
    {
        const stepSize = 3.0;
        const steps = this.meterRect.extents.y / stepSize;
        const stepExtents = new Point(this.meterRect.extents.x, stepSize);
        const hueStep = 360 / (steps - 1);

        let pos = this.meterRect.center.clone();
        pos.y -= 0.5*this.meterRect.extents.y;

        ctx.save();
        ctx.clip(this.meterRect.toPath2D());

        for(let i = 0; i < steps; i++)
        {
            const hue = i * hueStep;
            const color = new Color(hue, 100, 50);
            await drawRectangle(ctx, { center: pos, extents: stepExtents }, { fill: color })
            pos.y += stepExtents.y;
        }

        ctx.restore();
    }

    // draw a random assortment of shapes (some pretty standard, some chaotic random)
    async drawShapes(ctx, colors, blockHeight, cardSize)
    {
        const textDarken = CONFIG.cards.textDarkenFactor;
        const randShapeProb = CONFIG.sliderCards.shapes.completelyRandomizeProb;

        const shapes = RANDOM_SHAPE_LIST;
        const shapeList = shuffle(Object.keys(shapes));

        const maxShapeHeight = 0.75*blockHeight;
        const maxShapeDims = new Dims(new Point(), new Point(maxShapeHeight, maxShapeHeight));

        for(let i = 0; i < colors.length; i++)
        {
            const randShapeKey = shapeList[i % shapeList.length];
            let randShape = shapes[randShapeKey];
            let useRandomShape = Math.random() <= randShapeProb;
            if(useRandomShape) {
                const randShapeParams = {
                    corners: rangeInteger(4, 8),
                    chaos: range(0.2, 0.6),
                    radius: 0.5*maxShapeHeight,
                    spikiness: range(0.2, 0.6)
                } 
                randShape = createRandomShape(randShapeParams);
            } else {
                // the pre-existing shapes are normalized to -0.5<->0.5 range, so scale to correct size for card
                randShape = scalePath(randShape.toPath(), maxShapeHeight)
            }

            randShape = fitPath(randShape, maxShapeDims);
            randShape = new Path({ points: randShape });
            
            const color = colors[i];
            const translate = new Point(0.5*cardSize.x, (i+0.5) * blockHeight);
            const res = new ResourceShape({ shape: randShape });
            let randRotation = rangeInteger(0,7) * 0.25 * Math.PI;
            if(useRandomShape) { randRotation = 0; }

            const canvOp = new LayoutOperation({
                translate: translate,
                fill: color.darken(textDarken),
                rotation: randRotation
            })
            await res.toCanvas(ctx, canvOp);
        }
    }

    async drawActionIcons(ctx, colors, blockHeight, cardSize)
    {
        const numActions = this.actions.length;
        if(numActions <= 0) { return; }

        const numColorSteps = colors.length;
        const actionIconSize = new Point(CONFIG.sliderCards.actionIconSize * blockHeight);
        const actionBGColor = CONFIG.sliderCards.actionBGColor;
        let placeLeft = Math.random() <= 0.5;

        const grayscaleEffect = new GrayScaleEffect();

        const rectIndices = [];
        for(let i = 1; i < (numColorSteps-1); i++)
        {
            rectIndices.push(i);
        }
        shuffle(rectIndices);

        for(let i = 0; i < numActions; i++)
        {
            const actionKey = this.actions[i];
            const res = CONFIG.resLoader.getResource(CONFIG.actionSpritesheetKey);
            const rectIndex = rectIndices.pop();

            const x = placeLeft ? 0.2 * cardSize.x : 0.8 * cardSize.x;
            const y = (rectIndex + 0.5) * blockHeight

            const canvOp = new LayoutOperation({
                frame: ACTIONS[actionKey].frame,
                translate: new Point(x,y),
                dims: actionIconSize,
                pivot: Point.CENTER
            })

            if(CONFIG.inkFriendly)
            {
                canvOp.addEffect(grayscaleEffect);
            }

            const bgRectDims = actionIconSize.clone().scaleFactor(1.05);
            const bgRectRadius = 0.1*actionIconSize.x;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(
                canvOp.translate.x - 0.5*bgRectDims.x, canvOp.translate.y - 0.5*bgRectDims.y,
                bgRectDims.x, bgRectDims.y, 
                bgRectRadius);
            ctx.fillStyle = actionBGColor;
            ctx.strokeStyle = "transparent";
            ctx.fill();
            ctx.restore();

            placeLeft = !placeLeft;
            await res.toCanvas(ctx, canvOp);
        }
    }

    getMainData()
    {
        return SLIDERS[this.mainType];
    }

    getSubData()
    {
        return this.getMainData().subTypes[this.subType];
    }

    getExtremes()
    {
        const data = this.getSubData();
        return [data.low, data.high];
    }
}