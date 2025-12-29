
import { MaterialVisualizer, createContext, ResourceGroup, fillCanvas, TintEffect, LayoutOperation, Vector2, TextConfig, StrokeAlign, ResourceText, TextWeight, strokeCanvas } from "lib/pq-games";
import { CATEGORIES, Category } from "../shared/dict";

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
    
    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawCategory(vis, group);
        this.drawText(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group, ctx)
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
            pivot: Vector2.ZERO,
            size: vis.size,
            effects: effects
        });
        group.add(res, resOp);
    }

    drawCategory(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.resLoader.getResource("categories");
        const data = this.getCategoryData();

        // cloudy things at bottom for backdrop
        const bubbleOp = new LayoutOperation({
            frame: 3,
            size: new Vector2(vis.sizeUnit),
            pos: new Vector2(0, vis.size.y),
            pivot: new Vector2(0,1)
        })
        group.add(res, bubbleOp);

        // text with category
        const yPos = vis.get("cards.category.textYPos") * vis.size.y;
        const fontSize = vis.get("cards.category.textFontSize") * vis.sizeUnit;
        const strokeWidth = vis.get("cards.category.textStrokeWidth") * fontSize;
        const strokeColor = vis.inkFriendly ? "#212121" : data.colorText
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        }).alignCenter();

        const textOp = new LayoutOperation({
            fill: "#FFFFFF",
            pos: new Vector2(vis.center.x, yPos),
            size: new Vector2(vis.size.x, 1.5*fontSize),
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Vector2.CENTER
        })

        const resText = new ResourceText({ text: this.category, textConfig: textConfig });
        group.add(resText, textOp);

        // category icons left and right of text
        const cornerOffset = vis.get("cards.category.iconOffset") * vis.sizeUnit;
        const iconDims = new Vector2(vis.get("cards.category.iconSize") * vis.sizeUnit);
        const corners = [
            new Vector2(cornerOffset, yPos),
            new Vector2(vis.size.x - cornerOffset, yPos)
        ]

        for(const corner of corners)
        {
            const resOp = new LayoutOperation({
                frame: data.frame,
                pos: corner,
                size: iconDims,
                pivot: Vector2.CENTER,
                effects: vis.inkFriendlyEffect
            });
            group.add(res, resOp);
        }
    }

    drawText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        let text = this.data;
        if(this.category == Category.NEGATIVE) { 
            text = vis.get("cards.text.negativeCardPrefix") + this.uncapitalize(text);
        }

        const textLength = text.length;
        let fontSizeRaw = vis.get("cards.text.fontSize.large");
        if(textLength >= vis.get("cards.text.fontSizeCutoffs.large")) { fontSizeRaw = vis.get("cards.text.fontSize.medium"); }
        if(textLength >= vis.get("cards.text.fontSizeCutoffs.medium")) { fontSizeRaw = vis.get("cards.text.fontSize.small"); }
        if(textLength >= vis.get("cards.text.fontSizeCutoffs.small"))
        {
            console.error("A card has text that's too long for any font size (" + textLength + " characters): ", text);
        }

        const fontSize = fontSizeRaw * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            weight: TextWeight.BOLD
        }).alignCenter();

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = vis.get("cards.text.size").clone().scale(vis.size);
        const categoryData = this.getCategoryData();
        const colorText = vis.inkFriendly ? "#000000" : (categoryData.colorText ?? "#000000");
        const yPos = vis.get("cards.text.yPos") * vis.size.y;

        const textOp = new LayoutOperation({
            pos: new Vector2(vis.center.x, yPos),
            size: textDims,
            fill: colorText,
            pivot: Vector2.CENTER
        });
        group.add(resText, textOp);
    }

    uncapitalize(text:string)
    {
        return text.charAt(0).toLowerCase() + text.slice(1);
    }
}