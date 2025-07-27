import createContext from "js/pq_games/layout/canvas/createContext";
import { COLORS, MISC } from "../shared/dict";
import Visualizer from "./visualizer";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../shared/config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import TintEffect from "js/pq_games/layout/effects/tintEffect";

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
    async draw(vis:Visualizer)
    {
        await vis.cacheTintedSquares();

        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawNumber(vis, group);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:Visualizer, group: ResourceGroup, ctx)
    {
        const resBlock = vis.tintedSquareResource;
        const resBlockOp = new LayoutOperation({
            frame: this.getColorData().frame,
            size: vis.size,
            effects: vis.effects
        })
        group.add(resBlock, resBlockOp);
    }

    drawNumber(vis:Visualizer, group:ResourceGroup)
    {
        const fontSize = CONFIG.tokens.fontSize * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: CONFIG.fonts.heading,
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
            effects: vis.dropShadowEffects
        });
        group.add(resText, textOp);
    }
}