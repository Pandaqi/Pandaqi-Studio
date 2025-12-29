
import { MaterialVisualizer, createContext, ResourceGroup, fillCanvas, Vector2, LayoutOperation, TextConfig, ResourceText } from "lib/pq-games";
import { CATEGORIES, Category } from "../shared/dict";

export default class Token
{
    category: Category
    type: Category|number
    number: number

    constructor(c: Category, n: number = 0)
    {
        this.category = c;
        this.number = n;
        this.type = this.category ?? this.number; // just for my auto generate/debug system that listens for "type" property by default
    }

    displayNumber() { return this.number > 0; }
    getCategoryData() { return CATEGORIES[this.category]; }
    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, ctx);

        const hasNumber = this.number;
        if(this.displayNumber()) {
            this.drawText(vis, group);            
        } else {
            this.drawCategory(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:MaterialVisualizer, ctx)
    {
        let col = (vis.inkFriendly || this.displayNumber()) ? "#FFFFFF" : this.getCategoryData().colorBG;
        fillCanvas(ctx, col);
    }

    drawCategory(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.resLoader.getResource("categories");
        const data = this.getCategoryData();
        const frame = data.frame;
        const iconDims = new Vector2(vis.get("cards.token.iconSize") * vis.sizeUnit);

        const resOp = new LayoutOperation({
            frame: frame,
            pos: vis.center,
            size: iconDims,
            effects: vis.inkFriendlyEffect,
            pivot: Vector2.CENTER
        });
        group.add(res, resOp);
    }

    drawText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const fontSize = vis.get("cards.token.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        }).alignCenter();

        const text = this.number.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = vis.size;
        const colorText = "#000000";

        const textOp = new LayoutOperation({
            pos: vis.center,
            size: textDims,
            fill: colorText,
            pivot: Vector2.CENTER
        });
        group.add(resText, textOp);
    }
}