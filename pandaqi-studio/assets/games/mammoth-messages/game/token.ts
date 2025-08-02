import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import Point from "js/pq_games/tools/geometry/point";
import { CONFIG } from "../shared/config";
import { COLORS } from "../shared/dict";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { cacheVisualizationData } from "./card";

export default class Token
{
    type:string
    num:number
    
    constructor(t:string, n:number)
    {
        this.type = t;
        this.num = n;
    }

    getColorData() { return COLORS[this.type]; }
    async draw(vis:MaterialVisualizer)
    {
        await cacheVisualizationData(vis);

        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawNumber(vis, group);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:MaterialVisualizer, group: ResourceGroup, ctx)
    {
        const resBlock = vis.custom.tintedSquareResource;
        const resBlockOp = new LayoutOperation({
            frame: this.getColorData().frame,
            size: vis.size,
            effects: vis.inkFriendlyEffect
        })
        group.add(resBlock, resBlockOp);
    }

    drawNumber(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const fontSize = CONFIG.tokens.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG._drawing.fonts.heading,
            size: fontSize,
        }).alignCenter();

        const text = this.num.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = vis.size;
        
        const textOp = new LayoutOperation({
            pos: vis.center,
            size: textDims,
            fill: CONFIG.tokens.textColor ?? "#000000",
            stroke: CONFIG.tokens.strokeColor ?? "#FFFFFF",
            strokeWidth: CONFIG.tokens.strokeWidth * vis.sizeUnit,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER,
            effects: vis.custom.dropShadowEffects
        });
        group.add(resText, textOp);
    }
}