
import { MaterialVisualizer, createContext, ResourceGroup, LayoutOperation, TextConfig, ResourceText, StrokeAlign, Vector2 } from "lib/pq-games";
import { COLORS } from "../shared/dict";
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
        group.toCanvas(ctx);
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
        const fontSize = vis.get("tokens.fontSize") * vis.sizeUnit;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize,
        }).alignCenter();

        const text = this.num.toString();
        const resText = new ResourceText({ text: text, textConfig: textConfig });
        const textDims = vis.size;
        
        const textOp = new LayoutOperation({
            pos: vis.center,
            size: textDims,
            fill: vis.get("tokens.textColor") ?? "#000000",
            stroke: vis.get("tokens.strokeColor") ?? "#FFFFFF",
            strokeWidth: vis.get("tokens.strokeWidth") * vis.sizeUnit,
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Vector2.CENTER,
            effects: vis.custom.dropShadowEffects
        });
        group.add(resText, textOp);
    }
}