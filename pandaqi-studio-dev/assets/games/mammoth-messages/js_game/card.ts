import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import { COLORS, MISC } from "../js_shared/dict";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import shuffle from "js/pq_games/tools/random/shuffle";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import fromArray from "js/pq_games/tools/random/fromArray";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import Point from "js/pq_games/tools/geometry/point";
import range from "js/pq_games/tools/random/range";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import StrokeAlignValue from "js/pq_games/layout/values/strokeAlignValue";

export default class Card
{
    words: string[]
    colors: string[]

    constructor(w: string[])
    {
        this.words = w;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.colors = shuffle(Object.keys(COLORS));
        this.words = shuffle(this.words);
        
        this.drawBackground(vis, group, ctx);
        this.drawWords(vis, group);

        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:Visualizer, group, ctx)
    {
        if(vis.inkFriendly)
        {
            fillCanvas(ctx, "#FFFFFF");
            return;
        }

        // fill background with the word card template
        const res = vis.resLoader.getResource("word_card_template");
        const resOp = new LayoutOperation({
            dims: vis.size,
            effects: vis.effects
        });
        group.add(res, resOp);

        // add random secret messages (in night unreadable caveman font)
        const numMessages = CONFIG.cards.secretMessages.num.randomInteger();
        const fontSize = CONFIG.cards.secretMessages.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize
        }).alignCenter();

        for(let i = 0; i < numMessages; i++)
        {
            const text = fromArray(CONFIG.cards.secretMessages.options);
            const resText = new ResourceText({ text: text, textConfig: textConfig });
            const randRot = rangeInteger(0,8) * 0.25 * Math.PI;
            const randPos = new Point(range(0, vis.size.x), range(0, vis.size.y));
            const textOp = new LayoutOperation({
                fill: CONFIG.cards.secretMessages.textColor,
                translate: randPos,
                dims: new Point(3 * vis.size.y, 1.5 * fontSize),
                rotation: randRot,
                pivot: Point.CENTER,
                composite: "color-burn",
                alpha: CONFIG.cards.secretMessages.alpha
            });
            group.add(resText, textOp);
        }
    }

    drawWords(vis:Visualizer, group:ResourceGroup)
    {
        let yPos = CONFIG.cards.words.yPos * vis.size.y;
        const numWords = this.words.length;
        const distBetweenWords = (vis.size.y - yPos) / numWords;

        const fontSize = CONFIG.cards.words.fontSize * vis.sizeUnit;
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
        const resColor = vis.resLoader.getResource("colors");

        const iconDims = new Point(CONFIG.cards.words.iconDims * vis.sizeUnit);
        const strokeWidth = CONFIG.cards.words.strokeWidth * fontSize;
        const dividerDims = new Point(CONFIG.cards.words.dividerDims * vis.sizeUnit);
        const gapIconToText = CONFIG.cards.words.gapIconToText * vis.sizeUnit;

        for(let i = 0; i < numWords; i++)
        {
            const word = this.words[i];
            console.log(word);
            const num = (i + 1).toString();
            const color = this.colors[i];
            const colorData = COLORS[color];

            const xPos = xPositions[i % 2];
            const xPosOpposite = xPositions[(i + 1) % 2];
            
            // clay icon pushed against edge
            const resMiscOp = new LayoutOperation({
                translate: new Point(xPos, yPos),
                dims: iconDims,
                pivot: Point.CENTER,
                effects: [vis.dropShadowEffects, new TintEffect(colorData.color)].flat()
            });
            group.add(resMisc, resMiscOp);

            // color shape on top
            const colorShapeOp = new LayoutOperation({
                frame: colorData.frame,
                translate: new Point(xPos, yPos),
                dims: iconDims.clone().scale(CONFIG.cards.words.iconSymbolDims),
                pivot: Point.CENTER
            });
            group.add(resColor, colorShapeOp);

            // color shape on opposite side for clarity
            const colorShapeMirrorOp = colorShapeOp.clone(true);
            colorShapeMirrorOp.translate.x = xPosOpposite;
            colorShapeMirrorOp.alpha = 0.75;
            colorShapeMirrorOp.composite = "color-burn";
            colorShapeMirrorOp.dims.scale(0.75);
            group.add(resColor, colorShapeMirrorOp);

            // number on top
            const numberText = new ResourceText({ text: num, textConfig: textConfigNumber });
            const numberTextOp = new LayoutOperation({
                fill: "#FFFFFF",
                translate: new Point(xPos, yPos),
                dims: iconDims,
                pivot: Point.CENTER,
                effects: vis.dropShadowEffects
            });
            group.add(numberText, numberTextOp);

            // the actual word besides it
            const xPosText = margin + gapIconToText;

            const cfg = i % 2 == 0 ? textConfigLeft : textConfigRight; // @DEBUGGING: should be right
            const resText = new ResourceText({ text: word, textConfig: cfg });
            const textOp = new LayoutOperation({
                translate: new Point(xPosText, yPos),
                fill: colorData.colorText,
                dims: new Point(vis.size.x - xPosText*2, 1.5*fontSize),
                stroke: "#000000",
                strokeWidth: strokeWidth,
                strokeAlign: StrokeAlignValue.OUTSIDE,
                pivot: new Point(0, 0.5),
                effects: vis.dropShadowEffects
            });

            group.add(resText, textOp);

            // add a divider line for separation (not on the final one, of course)
            const isFinal = (i >= numWords - 1);
            if(!isFinal)
            {
                const dividerLineOp = new LayoutOperation({
                    frame: MISC.divider.frame,
                    translate: new Point(vis.center.x, yPos + 0.5 * distBetweenWords),
                    dims: dividerDims,
                    flipX: i % 2 == 1,
                    composite: "overlay",
                    alpha: CONFIG.cards.words.dividerAlpha,
                    pivot: Point.CENTER
                });
                group.add(resMisc, dividerLineOp);
    
            }

            // move to next location
            yPos += distBetweenWords;
        }
    }
}