import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import Point from "js/pq_games/tools/geometry/point";
import fromArray from "js/pq_games/tools/random/fromArray";
import range from "js/pq_games/tools/random/range";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { COLORS, MISC } from "../shared/dict";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";

export const cacheVisualizationData = async (vis:MaterialVisualizer) =>
{
    if(vis.custom && Object.keys(vis.custom).length > 0) { return; }

    const shadowOffset = new Point(0, 0.015).scale(vis.sizeUnit);
    const dropShadowEffects = [new DropShadowEffect({ offset: shadowOffset, color: "#00000077" })];

    const res = new ResourceImage();

    const resMisc = vis.getResource("misc") as ResourceImage;
    const resIcon = vis.getResource("colors") as ResourceImage;
    const newCanvases = [];

    // for each color ...
    for(const [colorKey,colorData] of Object.entries(COLORS))
    {
        // create a tinted clay background
        const img1 = resMisc.getImageFrameAsResource(MISC.clay_square.frame);
        const ctx = createContext({ size: img1.size });
        const op1 = new LayoutOperation({
            effects: [new TintEffect(colorData.color)]
        })
        img1.toCanvas(ctx, op1);

        // place the corresponding pattern centered on it (slightly scaled down to push off edges)
        const center = img1.size.clone().scale(0.5);
        const img2 = resIcon.getImageFrameAsResource(colorData.frame);
        const op2 = new LayoutOperation({
            pos: center,
            size: img1.size.clone().scale(0.85),
            pivot: Point.CENTER
        })

        // save resulting canvas
        const canv = img2.toCanvas(ctx, op2);
        newCanvases.push(canv);
    }

    // save these new frames on the resource
    const newFrames = await convertCanvasToImageMultiple(newCanvases, true);
    await res.addFrames(newFrames);

    vis.custom = { dropShadowEffects: dropShadowEffects, tintedSquareResource: res }
}

export default class Card
{
    words: string[]
    colors: string[]

    constructor(w: string[])
    {
        this.words = w;
    }

    async draw(vis:MaterialVisualizer)
    {
        await cacheVisualizationData(vis);

        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.colors = shuffle(Object.keys(COLORS));
        this.words = shuffle(this.words);
        
        this.drawBackground(vis, group, ctx);
        this.drawWords(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group, ctx)
    {
        if(vis.inkFriendly)
        {
            fillCanvas(ctx, "#FFFFFF");
            return;
        }

        // fill background with the word card template
        const res = vis.resLoader.getResource("word_card_template");
        const resOp = new LayoutOperation({
            size: vis.size,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, resOp);

        // add random secret messages (in night unreadable caveman font)
        const numMessages = CONFIG.cards.secretMessages.num.randomInteger();
        const fontSize = CONFIG.cards.secretMessages.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG._drawing.fonts.body,
            size: fontSize
        }).alignCenter();

        for(let i = 0; i < numMessages; i++)
        {
            const text = fromArray(CONFIG.cards.secretMessages.options) as string;
            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const randRot = rangeInteger(0,8) * 0.25 * Math.PI;
            const randPos = new Point(range(0, vis.size.x), range(0, vis.size.y));
            const textOp = new LayoutOperation({
                fill: CONFIG.cards.secretMessages.textColor,
                pos: randPos,
                size: new Point(3 * vis.size.y, 1.5 * fontSize),
                rot: randRot,
                pivot: Point.CENTER,
                composite: "color-burn",
                alpha: CONFIG.cards.secretMessages.alpha
            });
            group.add(resText, textOp);
        }
    }

    drawWords(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const fontSize = CONFIG.cards.words.fontSize * vis.sizeUnit;

        let yPos = CONFIG.cards.words.yPos * vis.size.y;
        if(vis.inkFriendly) { yPos = fontSize*1.5; } // if no "Word Card" at the top anyway, just use the full card size

        const numWords = this.words.length;
        const distBetweenWords = (vis.size.y - yPos) / numWords;

        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize
        }).alignCenter();

        const fontSizeNumber = CONFIG.cards.words.fontSizeNumber * vis.sizeUnit;
        const textConfigNumber = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSizeNumber
        }).alignCenter();

        const textConfigLeft = textConfig.clone(true);
        textConfigLeft.alignHorizontal = TextAlign.START;

        const textConfigRight = textConfig.clone(true);
        textConfigRight.alignHorizontal = TextAlign.END;

        const margin = CONFIG.cards.words.edgeMargin * vis.size.x;
        const xPositions = [margin, vis.size.x - margin];

        const resMisc = vis.resLoader.getResource("misc");
        const resBlock = vis.custom.tintedSquareResource;
        const resColor = vis.resLoader.getResource("colors");

        const iconDims = new Point(CONFIG.cards.words.iconDims * vis.sizeUnit);
        const strokeWidth = CONFIG.cards.words.strokeWidth * fontSize;
        const dividerDims = new Point(CONFIG.cards.words.dividerDims * vis.sizeUnit);
        const dividerAlpha = vis.inkFriendly ? CONFIG.cards.words.dividerAlphaInkFriendly : CONFIG.cards.words.dividerAlpha;
        const gapIconToText = CONFIG.cards.words.gapIconToText * vis.sizeUnit;

        for(let i = 0; i < numWords; i++)
        {
            const word = this.words[i];
            const num = (i + 1).toString();
            const color = this.colors[i];
            const colorData = COLORS[color];

            const xPos = xPositions[i % 2];
            const xPosOpposite = xPositions[(i + 1) % 2];

            // tinted clay square + pattern (read from cache)
            const resBlockOp = new LayoutOperation({
                frame: colorData.frame,
                pos: new Point(xPos, yPos),
                size: iconDims,
                pivot: Point.CENTER,
                effects: vis.custom.dropShadowEffects
            })
            group.add(resBlock, resBlockOp);
            
            // color shape on opposite side for clarity
            const colorShapeMirrorOp = new LayoutOperation({
                pos: new Point(xPosOpposite, yPos),
                size: iconDims.clone().scale(CONFIG.cards.words.iconSymbolDims).scale(0.75),
                frame: colorData.frame,
                alpha: 0.75,
                composite: "color-burn",
                effects: vis.inkFriendlyEffect,
                pivot: Point.CENTER
            })
            group.add(resColor, colorShapeMirrorOp);

            // number on top
            const numberText = new ResourceText({ text: num, textConfig: textConfigNumber });
            const numberTextOp = new LayoutOperation({
                fill: "#FFFFFF",
                pos: new Point(xPos, yPos),
                size: iconDims,
                pivot: Point.CENTER,
                effects: vis.custom.dropShadowEffects
            });
            group.add(numberText, numberTextOp);

            // the actual word besides it
            const xPosText = margin + gapIconToText;

            const cfg = i % 2 == 0 ? textConfigLeft : textConfigRight;
            const resText = new ResourceText({ text: word, textConfig: cfg });
            const textColor = vis.inkFriendly ? "#FFFFFF" : colorData.colorText;
            const textOp = new LayoutOperation({
                pos: new Point(xPosText, yPos),
                fill: textColor,
                size: new Point(vis.size.x - xPosText*2, 1.5*fontSize),
                stroke: "#000000",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlign.OUTSIDE,
                pivot: new Point(0, 0.5),
                effects: vis.custom.dropShadowEffects
            });

            group.add(resText, textOp);

            // add a divider line for separation (not on the final one, of course)
            const isFinal = (i >= numWords - 1);
            if(!isFinal)
            {
                const dividerLineOp = new LayoutOperation({
                    frame: MISC.divider.frame,
                    pos: new Point(vis.center.x, yPos + 0.5 * distBetweenWords),
                    size: dividerDims,
                    flipX: i % 2 == 1,
                    composite: "overlay",
                    alpha: dividerAlpha,
                    pivot: Point.CENTER
                });
                group.add(resMisc, dividerLineOp);
    
            }

            // move to next location
            yPos += distBetweenWords;
        }
    }
}