
import { MaterialVisualizer, createContext, ResourceGroup, fillCanvas, Vector2, LayoutOperation } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { DRAWINGS } from "../shared/dict";

export default class Drawing
{
    type:string
    
    constructor(t:string)
    {
        this.type = t;
    }

    getTypeData() { return DRAWINGS[this.type]; }
    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, group, ctx);
        this.drawContent(vis, group);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:MaterialVisualizer, group: ResourceGroup, ctx)
    {
        // solid color
        let col = vis.inkFriendly ? "#FFFFFF" : "#FFFFFF";
        fillCanvas(ctx, col);
    }

    drawContent(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = this.getTypeData();
        const res = vis.resLoader.getResource("cave_drawings");
        const frame = data.frame;
        const iconDims = new Vector2(vis.get("drawings.iconSize") * vis.sizeUnit);
        const resOp = new LayoutOperation({
            frame: frame,
            pos: vis.center,
            size: iconDims,
            pivot: Vector2.CENTER
        })
        group.add(res, resOp);
    }
}