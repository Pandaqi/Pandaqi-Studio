import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "./config";
import equidistantColorsBetweenOpposites from "./tools/equidistantColorsBetweenOpposites";
import createWavyRect from "./tools/createWavyRect";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import { ACTIONS, RANDOM_SHAPE_LIST, SLIDERS } from "../js_shared/dict";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import GrayScaleEffect from "js/pq_games/layout/effects/grayScaleEffect";
import Color from "js/pq_games/layout/color/color";
import TextConfig from "js/pq_games/layout/text/textConfig";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import range from "js/pq_games/tools/random/range";
import Path from "js/pq_games/tools/geometry/paths/path";
import createRandomShape from "js/pq_games/tools/geometry/random/createRandomShape";
import scalePath from "js/pq_games/tools/geometry/transform/scalePath";

export default class Slider
{
    mainType:string
    subType:string
    actions: string[]
    meterRect: Rectangle
    wavyRect: ResourceShape;

    constructor(mt:string, st:string, ac:string[])
    {
        this.mainType = mt;
        this.subType = st;
        this.actions = ac;
    }

    async draw()
    {
        const colorSteps = CONFIG.sliderCards.numColorSteps;

        const cardSize = CONFIG.sliderCards.size;
        const ctx = createContext({ size: cardSize });
        const blockHeight = cardSize.y / colorSteps;
        
        const wavyRectSize = new Point(cardSize.x, blockHeight);
        this.wavyRect = createWavyRect(wavyRectSize, 5, 5, 3);

        const textConfig = CONFIG.cards.textConfig;
        textConfig.size = CONFIG.cards.textScale * blockHeight;

        // @TODO: put wavy rect and saturation/lightness into config, so it's consistent between word and slider cards
        const saturation = CONFIG.inkFriendly ? 0 : 85;
        const colors = equidistantColorsBetweenOpposites(colorSteps, saturation, 50);

        await this.drawBackground(ctx, colors, blockHeight, cardSize);
        await this.drawCustom(ctx, colors, textConfig, blockHeight, cardSize);
        await this.drawActionIcons(ctx, colors, blockHeight, cardSize);
        
        return ctx.canvas;
    }

    async drawBackground(ctx, colors, blockHeight, cardSize)
    {
        // draw all color steps
        for(let a = 0; a < colors.length; a++)
        {
            const color = colors[a];
            const canvOp = new LayoutOperation({
                translate: new Point(0, blockHeight*a),
                fill: color
            });
            await this.wavyRect.toCanvas(ctx, canvOp);
        }

        const needsMeter = this.getMainData().needsMeter;

        // draw the meter
        if(needsMeter)
        {
            const center = cardSize.clone().scaleFactor(0.5);
            const extents = new Point(0.33*cardSize.x, cardSize.y - 2*0.75*blockHeight);
            this.meterRect = new Rectangle({ center: center, extents: extents });
            const meterBG = CONFIG.sliderCards.meterBackgroundColor;
            const canvOp = new LayoutOperation({
                fill: meterBG,
                stroke: "#000000",
                strokeWidth: 5
            });
            const res = new ResourceShape({ shape: this.meterRect });
            res.toCanvas(ctx, canvOp);
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

            const word = extremes[i];
            const text = new ResourceText({ text: word, textConfig: textConfig })

            const translate = (i == 0) ? new Point(0, 0.5*blockHeight) : new Point(0, cardSize.y - 0.5*blockHeight)
            const canvOp = new LayoutOperation({
                translate: translate,
                fill: color.darken(textDarken),
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

        for(let i = 0; i < colors.length; i++)
        {
            const fontKey =  CONFIG.fonts["special" + fonts.pop()].key;
            const tempTextCfg = new TextConfig({
                font: fontKey
            })

            const word = this.getRandomWord();

            const translate = new Point(0, (i+0.5) * blockHeight);
            const res = new ResourceText({ text: word, textConfig: tempTextCfg })
            const canvOp = new LayoutOperation({
                translate: translate,
                fill: colors[i].darken(textDarken),
                dims: new Point(cardSize.x, blockHeight)
            })
            await res.toCanvas(ctx, canvOp);
        }
    }

    getRandomWord()
    {
        const realWord = Math.random() <= CONFIG.sliderCards.words.useRealWordProb;
        if(realWord) { return CONFIG.pandaqiWords.getRandom(true); }

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
        const stepSize = 1.0;
        const steps = this.meterRect.extents.y / stepSize;
        const stepExtents = new Point(this.meterRect.extents.x, stepSize);
        const hueStep = 360 / (steps - 1);

        // @TODO: a lot of syntax just to get a tiny rectangle in a color => create convenience functions like "drawRect" and "drawCircle" and stuff?
        for(let i = 0; i < steps; i++)
        {
            const hue = i * hueStep;
            const color = new Color(hue, 75, 75);
            const rect = new Rectangle({ center: this.meterRect.center, extents: stepExtents });
            const res = new ResourceShape({ shape: rect });
            const canvOp = new LayoutOperation({
                fill: color
            })
            res.toCanvas(ctx, canvOp);
        }
    }

    // draw a random assortment of shapes (some pretty standard, some chaotic random)
    async drawShapes(ctx, colors, blockHeight, cardSize)
    {
        const textDarken = CONFIG.cards.textDarkenFactor;
        const randShapeProb = CONFIG.sliderCards.shapes.completelyRandomizeProb;

        const shapes = RANDOM_SHAPE_LIST;
        const shapeList = shuffle(Object.keys(shapes));

        const maxShapeHeight = 0.75*blockHeight;

        for(let i = 0; i < colors.length; i++)
        {
            let randShape = shapes[shapeList.pop()];
            let useRandomShape = Math.random() <= randShapeProb;
            if(useRandomShape) {
                const randShapeParams = {
                    corners: rangeInteger(4, 8),
                    chaos: range(0.2, 0.6),
                    radius: 0.5*maxShapeHeight,
                    spikiness: range(0.2, 0.6)
                } 
                randShape = new Path({ points: createRandomShape(randShapeParams) }); 
            } else {
                // the pre-existing shapes are normalized to -0.5<->0.5 range, so scale to correct size for card
                randShape = new Path({ points: scalePath(randShape.toPath(), maxShapeHeight) });
            }
            
            const color = colors[i];
            const translate = new Point(0.5*cardSize.x, (i+0.5) * blockHeight);
            const res = new ResourceShape({ shape: randShape });
            const randRotation = rangeInteger(0,7) * 0.25 * Math.PI
            const canvOp = new LayoutOperation({
                translate: translate,
                fill: color.darken(textDarken),
                rotation: randRotation
            })
            res.toCanvas(ctx, canvOp);
        }
    }

    async drawActionIcons(ctx, colors, blockHeight, cardSize)
    {
        const numActions = this.actions.length;
        if(numActions <= 0) { return; }

        const numColorSteps = colors.length;
        const distBetweenActions = Math.ceil(numActions / numColorSteps);
        const actionIconSize = new Point(CONFIG.sliderCards.actionIconSize * blockHeight);
        let rectIndex = Math.floor(Math.random() * numColorSteps);
        let placeLeft = Math.random() <= 0.5;

        const grayscaleEffect = new GrayScaleEffect();

        for(let i = 0; i < numActions; i++)
        {
            const actionKey = this.actions[i];
            const res = CONFIG.resLoader.getResource(CONFIG.actionSpritesheetKey);

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

            placeLeft = !placeLeft;
            rectIndex = (rectIndex + distBetweenActions) % numActions;
            await res.toCanvas(ctx, canvOp);
        }
    }

    getMainData()
    {
        return SLIDERS[this.mainType];
    }

    getData()
    {
        return this.getMainData()[this.subType];
    }

    getExtremes()
    {
        const data = this.getData();
        return [data.low, data.high];
    }
}