
import { CONFIG } from "./config";
import equidistantColorsBetweenOpposites from "../game/tools/equidistantColorsBetweenOpposites";
import createWavyRect from "../game/tools/createWavyRect";
import { ACTIONS, PROPERTIES, RANDOM_SHAPE_LIST, SLIDERS } from "./dict";
import { Rectangle, ResourceShape, getWeighted, MaterialVisualizer, createContext, Vector2, Color, LayoutOperation, RectangleRounded, TextConfig, ResourceText, shuffle, TextAlign, rangeInteger, Dims, range, scalePath, fitPath, Path, GrayScaleEffect, ResourceImage, colorDarken, getColorContrastHighest, createRandomShape } from "lib/pq-games";

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

    async draw(vis:MaterialVisualizer) : Promise<HTMLCanvasElement>
    {
        const colorSteps = vis.get("sliderCards.numColorSteps");

        const ctx = createContext({ size: vis.size });

        const blockHeight = vis.size.y / colorSteps;
        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        
        const wavyRectSize = new Vector2(vis.size.x, blockHeight + 4*amp);
        this.wavyRect = createWavyRect(wavyRectSize, amp, CONFIG.wavyRect.frequency, CONFIG.wavyRect.stepSize);

        const textConfig = vis.get("textConfig").clone();
        textConfig.size = vis.get("sliderCards.textScale") * blockHeight;

        const saturation = vis.inkFriendly ? 0 : CONFIG.wavyRect.saturation;
        const lightness = vis.inkFriendly ? 100 : CONFIG.wavyRect.lightness;
        const colors = equidistantColorsBetweenOpposites(colorSteps, saturation, lightness);

        this.createOutlineRect(vis, ctx, vis.size);
        ctx.clip(); // uses the path we just created above

        this.drawBackground(vis, ctx, colors, blockHeight, vis.size);
        
        this.drawCustom(vis, ctx, colors, textConfig, blockHeight, vis.size);
        this.drawActionIcons(vis, ctx, colors, blockHeight, vis.size);

        return ctx.canvas;
    }

    createOutlineRect(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, itemSize:Vector2)
    {
        const lw = vis.get("outline.width") * itemSize.x;
        const radius = vis.get("outline.radius") * itemSize.x;

        ctx.roundRect(0.5*lw, 0.5*lw, itemSize.x-lw, itemSize.y-lw, radius);
    }

    drawBackground(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, colors:Color[], blockHeight:number, itemSize:Vector2)
    {
        // draw all color steps
        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        for(let a = 0; a < colors.length; a++)
        {
            const color = colors[a];
            const topOffset = a == 0 ? -2*amp : 0;
            const canvOp = new LayoutOperation({
                pos: new Vector2(0, blockHeight*a + topOffset),
                pivot: Vector2.ZERO,
                fill: color,
                stroke: "#000000",
                strokeWidth: 1,
            });
            this.wavyRect.toCanvas(ctx, canvOp);
        }

        const needsMeter = this.getMainData().needsMeter;

        // draw the meter
        if(needsMeter)
        {
            const mdata = vis.get("sliderCards.meter");
            const center = itemSize.clone().scaleFactor(0.5);
            const originalMeterExtents = mdata.extents;
            const extents = itemSize.clone().scale(originalMeterExtents);

            // the actual meter
            const radius = mdata.borderRadius * itemSize.x;
            this.meterRect = new RectangleRounded({ center: center, extents: extents, radius: radius });
            const meterBG = mdata.backgroundColor;
            const canvOp = new LayoutOperation({
                fill: meterBG,
                stroke: "#000000",
                strokeWidth: mdata.lineWidth * itemSize.x
            });
            const res = new ResourceShape({ shape: this.meterRect });
            res.toCanvas(ctx, canvOp);

            // tiny lines of a grid for more precision/decoration
            const numLines = 32;
            const distBetweenLines = extents.y / numLines;
            const lineHeight = distBetweenLines * 0.1;
            const lineExtents = new Vector2(0.8 * extents.x, lineHeight)
            const linePos = new Vector2(center.x, center.y - 0.5*extents.y);
            for(let i = 0; i < numLines; i++)
            {
                const rect = new ResourceShape(new Rectangle({ center: linePos, extents: lineExtents }));
                const op = new LayoutOperation({ fill: "#000000", alpha: 0.35 });
                rect.toCanvas(ctx.canvas, op);
                linePos.y += distBetweenLines;
            }
        }
    }

    drawCustom(vis: MaterialVisualizer, ctx:CanvasRenderingContext2D, colors:Color[], textConfig:TextConfig, blockHeight:number, itemSize:Vector2)
    {
        if(this.mainType == "property") { this.drawProperties(vis, ctx, colors, textConfig, blockHeight, itemSize); }
        else if(this.mainType == "words") { this.drawWords(vis, ctx, colors, blockHeight, itemSize); }
        else if(this.mainType == "color") { this.drawColorRamp(ctx); }
        else if(this.mainType == "shapes") { this.drawShapes(vis, ctx, colors, blockHeight, itemSize); }
    }

    // draw text with extremes
    drawProperties(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, colors:Color[], textConfig:TextConfig, blockHeight:number, itemSize:Vector2)
    {
        const textDarken = vis.get("cards.textDarkenFactor");
        const extremes = this.getExtremes();
        for(let i = 0; i < extremes.length; i++)
        {
            const color = (i == 0) ? colors[0] : colors[colors.length-1];
            let finalColor = getColorContrastHighest(color, [colorDarken(color, textDarken), Color.WHITE]);
            if(vis.inkFriendly) { finalColor = Color.BLACK; }

            const word = extremes[i];
            const text = new ResourceText({ text: word, textConfig: textConfig })

            const translate = (i == 0) ? Vector2.ZERO : new Vector2(0, itemSize.y - blockHeight)
            const canvOp = new LayoutOperation({
                pivot: Vector2.ZERO,
                pos: translate,
                fill: finalColor,
                size: new Vector2(itemSize.x, blockHeight)
            })
            text.toCanvas(ctx, canvOp);
        }
    }

    // draw random words/letters in random fonts
    drawWords(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, colors:Color[], blockHeight:number, itemSize:Vector2)
    {
        const textDarken = vis.get("cards.textDarkenFactor");
        const fonts = [];
        for(let i = 0; i < CONFIG.numSpecialFonts; i++)
        {
            fonts.push(i);
        }
        shuffle(fonts);

        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        const allFontsData = vis.get("fonts") ?? {};
        for(let i = 0; i < colors.length; i++)
        {
            const fontKey = allFontsData["special" + fonts.pop()].key;
            const tempTextCfg = new TextConfig({
                font: fontKey,
                size: 0.5*blockHeight,
                alignHorizontal: TextAlign.MIDDLE,
                alignVertical: TextAlign.MIDDLE
            })

            // @EXCEPTION: this is an abnormally large font by default
            if(fontKey == "AnuDaw") { tempTextCfg.size *= 0.5; }

            const color = colors[i];
            let finalColor = getColorContrastHighest(color, [colorDarken(color, textDarken), Color.WHITE]);
            if(vis.inkFriendly) { finalColor = Color.BLACK; }

            const word = this.getRandomWord(vis);

            const translate = new Vector2(0, i * blockHeight - 0.5*amp);
            const res = new ResourceText({ text: word, textConfig: tempTextCfg })
            const canvOp = new LayoutOperation({
                pos: translate,
                fill: finalColor,
                size: new Vector2(itemSize.x, blockHeight)
            })
            res.toCanvas(ctx, canvOp);
        }
    }

    getRandomWord(vis:MaterialVisualizer) : string
    {
        const useRealWord = Math.random() <= vis.get("sliderCards.words.useRealWordProb");
        if(useRealWord) 
        { 
            const realWord = CONFIG.pandaqiWords.getRandom(true).getWord(); 
            return realWord;
        }

        const randLength = rangeInteger(vis.get("sliderCards.words.stringLengthBounds"));
        const arr = [];
        for(let i = 0; i < randLength; i++)
        {
            arr.push(this.getRandomLetter());
        }
        return arr.join("");
    }

    getRandomLetter() : string
    {
        return String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }

    // just draw the full color wheel from top to bottom
    drawColorRamp(ctx:CanvasRenderingContext2D)
    {
        const stepSize = 3.0;
        const steps = this.meterRect.extents.y / stepSize;
        const stepExtents = new Vector2(this.meterRect.extents.x, stepSize);
        const hueStep = 360 / (steps - 1);

        let pos = this.meterRect.center.clone();
        pos.y -= 0.5*this.meterRect.extents.y;

        ctx.save();
        ctx.clip(this.meterRect.toPath2D());

        for(let i = 0; i < steps; i++)
        {
            const hue = i * hueStep;
            const color = new Color(hue, 100, 50);
            const rect = new ResourceShape(new Rectangle({ center: pos, extents: stepExtents }));
            const op = new LayoutOperation({ fill: color });
            rect.toCanvas(ctx.canvas, op);
            pos.y += stepExtents.y;
        }

        ctx.restore();
    }

    // draw a random assortment of shapes (some pretty standard, some chaotic random)
    drawShapes(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, colors:Color[], blockHeight:number, itemSize:Vector2)
    {
        const textDarken = vis.get("cards.textDarkenFactor");
        const randShapeProb = vis.get("sliderCards.shapes.completelyRandomizeProb");

        const shapes = RANDOM_SHAPE_LIST;
        const shapeList = shuffle(Object.keys(shapes));

        const maxShapeHeight = 0.75*blockHeight;
        const maxShapeDims = new Dims(Vector2.ZERO, new Vector2(maxShapeHeight, maxShapeHeight));

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
            randShape = new Path(randShape);
            
            const color = colors[i];
            const translate = new Vector2(0.5*itemSize.x, (i+0.5) * blockHeight);
            const res = new ResourceShape({ shape: randShape });
            let randRotation = rangeInteger(0,7) * 0.25 * Math.PI;
            if(useRandomShape) { randRotation = 0; }

            const canvOp = new LayoutOperation({
                pos: translate,
                fill: colorDarken(color, textDarken),
                rot: randRotation
            })
            res.toCanvas(ctx, canvOp);
        }
    }

    drawActionIcons(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D, colors:Color[], blockHeight:number, itemSize:Vector2)
    {
        const numActions = this.actions.length;
        if(numActions <= 0) { return; }

        const numColorSteps = colors.length;
        const actionIconSize = new Vector2(vis.get("sliderCards.actionIconSize") * blockHeight);
        const actionBGColor = vis.get("sliderCards.actionBGColor");
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
            const res = vis.getResource(CONFIG.actionSpritesheetKey) as ResourceImage;
            const rectIndex = rectIndices.pop();

            const x = placeLeft ? 0.2 * itemSize.x : 0.8 * itemSize.x;
            const y = (rectIndex + 0.5) * blockHeight

            const canvOp = new LayoutOperation({
                frame: ACTIONS[actionKey].frame,
                pos: new Vector2(x,y),
                size: actionIconSize,
                pivot: Vector2.CENTER
            })

            if(vis.inkFriendly)
            {
                canvOp.addEffect(grayscaleEffect);
            }

            const bgRectDims = actionIconSize.clone().scaleFactor(1.05);
            const bgRectRadius = 0.1*actionIconSize.x;
            ctx.save();
            ctx.resetTransform();
            ctx.beginPath();
            ctx.roundRect(
                canvOp.pos.x - 0.5*bgRectDims.x, canvOp.pos.y - 0.5*bgRectDims.y,
                bgRectDims.x, bgRectDims.y, 
                bgRectRadius);
            ctx.fillStyle = actionBGColor;
            ctx.strokeStyle = "transparent";
            ctx.fill();
            ctx.restore();

            placeLeft = !placeLeft;
            res.toCanvas(ctx, canvOp);
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
        return [data.high, data.low]; // reverse order, so "high" actually ends up "high" on the card
    }
}