import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import { CATEGORIES, Category } from "../js_shared/dict";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import StrokeAlignValue from "js/pq_games/layout/values/strokeAlignValue";

export default class Card
{
    category: Category;
    pack: string;
    data: string;
    type: Category;

    constructor(c: Category, pack: string, data:string)
    {
        this.category = c;
        this.type = this.category;
        this.pack = pack;
        this.data = data;
    }

    getCategoryData() { return CATEGORIES[this.category]; }
    
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawCategory(vis, group);
        this.drawText(vis, group);

        await group.toCanvas(ctx);
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    drawBackground(vis:Visualizer, group, ctx)
    {
        // entire background fill
        const data = this.getCategoryData();
        let col = vis.inkFriendly ? "#FFFFFF" : data.colorMid;
        fillCanvas(ctx, col);

        // the page with the crooked corner
        const res = vis.resLoader.getResource("template_tintable");
        const effects = [];
        if(!vis.inkFriendly)
        {
            effects.push(new TintEffect({ color: data.colorBG }))
        }

        const resOp = new LayoutOperation({
            dims: vis.size,
            effects: effects
        });
        group.add(res, resOp);
    }

    drawCategory(vis:Visualizer, group:ResourceGroup)
    {
        const res = vis.resLoader.getResource("categories");
        const data = this.getCategoryData();

        // cloudy things at bottom for backdrop
        const bubbleOp = new LayoutOperation({
            frame: 3,
            dims: new Point(vis.sizeUnit),
            translate: new Point(0, vis.size.y),
            pivot: new Point(0,1)
        })
        group.add(res, bubbleOp);

        // text with category
        const yPos = CONFIG.cards.category.textYPos * vis.size.y;
        const fontSize = CONFIG.cards.category.textFontSize * vis.sizeUnit;
        const strokeWidth = CONFIG.cards.category.textStrokeWidth * fontSize;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
        }).alignCenter();

        const textOp = new LayoutOperation({
            fill: "#FFFFFF",
            translate: new Point(vis.center.x, yPos),
            dims: new Point(vis.size.x, 1.5*fontSize),
            stroke: data.colorText,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            pivot: Point.CENTER
        })

        const resText = new ResourceText({ text: this.category, textConfig: textConfig });
        group.add(resText, textOp);

        // category icons left and right of text
        const cornerOffset = CONFIG.cards.category.iconOffset * vis.sizeUnit;
        const iconDims = new Point(CONFIG.cards.category.iconSize * vis.sizeUnit);
        const corners = [
            new Point(cornerOffset, yPos),
            new Point(vis.size.x - cornerOffset, yPos)
        ]

        for(const corner of corners)
        {
            const resOp = new LayoutOperation({
                frame: data.frame,
                translate: corner,
                dims: iconDims,
                pivot: Point.CENTER,
                effects: vis.effects
            });
            group.add(res, resOp);
        }
    }

    drawText(vis:Visualizer, group:ResourceGroup)
    {
        let text = this.data;
        if(this.category == Category.NEGATIVE) { 
            text = CONFIG.cards.text.negativeCardPrefix + this.uncapitalize(text);
        }

        const textLength = text.length;
        let fontSizeRaw = CONFIG.cards.text.fontSize.large;
        if(textLength >= CONFIG.cards.text.fontSizeCutoffs.large) { fontSizeRaw = CONFIG.cards.text.fontSize.medium; }
        if(textLength >= CONFIG.cards.text.fontSizeCutoffs.medium) { fontSizeRaw = CONFIG.cards.text.fontSize.small; }
        if(textLength >= CONFIG.cards.text.fontSizeCutoffs.small)
        {
            console.error("A card has text that's too long for any font size (" + textLength + " characters): ", text);
        }

        const fontSize = fontSizeRaw * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
            weight: TextWeight.BOLD
        }).alignCenter();

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = CONFIG.cards.text.dims.clone().scale(vis.size);
        const categoryData = this.getCategoryData();
        const colorText = vis.inkFriendly ? "#000000" : (categoryData.colorText ?? "#000000");
        const yPos = CONFIG.cards.text.yPos * vis.size.y;

        const textOp = new LayoutOperation({
            translate: new Point(vis.center.x, yPos),
            dims: textDims,
            fill: colorText,
            pivot: Point.CENTER
        });
        group.add(resText, textOp);
    }

    uncapitalize(text:string)
    {
        return text.charAt(0).toLowerCase() + text.slice(1);
    }

    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}