import createContext from "js/pq_games/layout/canvas/createContext";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import Visualizer from "./visualizer";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import { CATEGORIES, Category } from "../js_shared/dict";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import getRectangleCornersWithOffset from "js/pq_games/tools/geometry/paths/getRectangleCornersWithOffset";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";

export default class Card
{
    category: Category;
    pack: string;
    data: string;

    constructor(c: Category, pack: string, data:string)
    {
        this.category = c;
        this.pack = pack;
        this.data = data;
    }

    getCategoryData() { return CATEGORIES[this.category]; }
    
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, ctx);
        this.drawCategory(vis, group);
        this.drawText(vis, group);
        
        this.drawOutline(vis, ctx);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:Visualizer, ctx)
    {
        let col = vis.inkFriendly ? "#FFFFFF" : this.getCategoryData().colorBG;
        fillCanvas(ctx, col);
    }

    drawCategory(vis:Visualizer, group:ResourceGroup)
    {
        const res = vis.resLoader.getResource("categories");
        const cornerOffset = new Point(CONFIG.cards.category.iconOffset * vis.sizeUnit);
        const corners = getRectangleCornersWithOffset(vis.size, cornerOffset);
        const data = this.getCategoryData();
        const iconDims = new Point(CONFIG.cards.category.iconSize * vis.sizeUnit);

        for(const corner of corners)
        {
            const resOp = new LayoutOperation({
                frame: data.frame,
                translate: corner,
                size: iconDims,
            });
            group.add(res, resOp);
        }
    }

    drawText(vis:Visualizer, group:ResourceGroup)
    {
        const fontSize = CONFIG.cards.text.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.body,
            size: fontSize,
        }).alignCenter();

        let text = this.data; // @TODO: not sure if this can just be a string, or we need an object with more data
        if(this.category == Category.NEGATIVE) { 
            text = CONFIG.cards.text.negativeCardPrefix + this.uncapitalize(text);
        }

        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = CONFIG.cards.text.dims.clone().scale(vis.size);
        const categoryData = this.getCategoryData();
        const colorText = categoryData.colorText ?? "#000000";

        const textOp = new LayoutOperation({
            translate: vis.center,
            dims: textDims,
            fill: colorText
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