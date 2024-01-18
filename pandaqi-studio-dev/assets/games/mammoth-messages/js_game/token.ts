import createContext from "js/pq_games/layout/canvas/createContext";
import { COLORS, MISC } from "../js_shared/dict";
import Visualizer from "./visualizer";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlignValue from "js/pq_games/layout/values/strokeAlignValue";
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
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawNumber(vis, group);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:Visualizer, group: ResourceGroup, ctx)
    {
        // clay square thingy (which acts as entirely solid background)
        const data = this.getColorData();
        const tintCol = vis.inkFriendly ? "#FFFFFF" : data.color; 
        const resBlock = vis.resLoader.getResource("misc");
        const resBlockOp = new LayoutOperation({
            frame: MISC.clay_square.frame,
            dims: vis.size,
            effects: [new TintEffect({ color: tintCol })]
        });
        group.add(resBlock, resBlockOp);

        // pattern / symbol for this color
        const res = vis.resLoader.getResource("colors");
        const iconDims = new Point(CONFIG.tokens.iconDims * vis.sizeUnit);
        const resOp = new LayoutOperation({
            frame: data.frame,
            translate: vis.center,
            dims: iconDims,
            effects: vis.effects,
            pivot: Point.CENTER
        })
        group.add(res, resOp);
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
            translate: vis.center,
            dims: textDims,
            fill: CONFIG.tokens.textColor ?? "#000000",
            stroke: CONFIG.tokens.strokeColor ?? "#FFFFFF",
            strokeWidth: CONFIG.tokens.strokeWidth * vis.sizeUnit,
            strokeAlign: StrokeAlignValue.OUTSIDE,
            pivot: Point.CENTER,
            effects: vis.dropShadowEffects
        });
        group.add(resText, textOp);
    }
}