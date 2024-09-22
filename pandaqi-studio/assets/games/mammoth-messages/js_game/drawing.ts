import createContext from "js/pq_games/layout/canvas/createContext";
import { DRAWINGS } from "../js_shared/dict";
import Visualizer from "./visualizer";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../js_shared/config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
export default class Drawing
{
    type:string
    
    constructor(t:string)
    {
        this.type = t;
    }

    getTypeData() { return DRAWINGS[this.type]; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawContent(vis, group);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:Visualizer, group: ResourceGroup, ctx)
    {
        // solid color
        let col = vis.inkFriendly ? "#FFFFFF" : "#FFFFFF";
        fillCanvas(ctx, col);
    }

    drawContent(vis:Visualizer, group:ResourceGroup)
    {
        const data = this.getTypeData();
        const res = vis.resLoader.getResource("cave_drawings");
        const frame = data.frame;
        const iconDims = new Point(CONFIG.drawings.iconSize * vis.sizeUnit);
        const resOp = new LayoutOperation({
            frame: frame,
            pos: vis.center,
            size: iconDims,
            pivot: Point.CENTER
        })
        group.add(res, resOp);
    }
}