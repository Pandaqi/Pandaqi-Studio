import createContext from "js/pq_games/layout/canvas/createContext";
import { CATEGORIES, Category } from "../js_shared/dict";
import Visualizer from "./visualizer";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";

export default class Token
{
    category: Category
    number: number

    constructor(c: Category, n: number = 0)
    {
        this.category = c;
        this.number = n;
    }

    displayNumber() { return this.number > 0; }
    getCategoryData() { return CATEGORIES[this.category]; }
    async draw(vis:Visualizer)
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

        this.drawOutline(vis, ctx);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:Visualizer, ctx)
    {
        let col = (vis.inkFriendly || this.displayNumber()) ? "#FFFFFF" : this.getCategoryData().colorBG;
        fillCanvas(ctx, col);
    }

    drawCategory(vis:Visualizer, group:ResourceGroup)
    {
        const res = vis.resLoader.getResource("categories");
        const data = this.getCategoryData();
        const frame = data.frame;
        const iconDims = new Point(CONFIG.cards.token.iconSize * vis.sizeUnit);

        const resOp = new LayoutOperation({
            frame: frame,
            translate: vis.center,
            size: iconDims,
        });
        group.add(res, resOp);
    }

    drawText(vis:Visualizer, group:ResourceGroup)
    {
        const fontSize = CONFIG.cards.token.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
            size: fontSize,
        }).alignCenter();

        const text = this.number.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = vis.size;
        const categoryData = this.getCategoryData();
        const colorText = categoryData.colorText ?? "#000000";

        const textOp = new LayoutOperation({
            translate: vis.center,
            dims: textDims,
            fill: colorText
        });
        group.add(resText, textOp);
    }

    drawOutline(vis:Visualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}