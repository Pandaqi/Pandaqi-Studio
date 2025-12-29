import { MaterialVisualizer, createContext, ResourceGroup, fillCanvas, Vector2, LayoutOperation } from "lib/pq-games";
import { TokenType, TOKEN_TYPES } from "../shared/dict";

export default class Token
{
    type:TokenType
    
    constructor(t: TokenType)
    {
        this.type = t;
    }

    getTypeData() { return TOKEN_TYPES[this.type]; }
    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();
        
        this.drawBackground(vis, ctx);
        this.drawContent(vis, group);
        await group.toCanvas(ctx);
        return ctx.canvas;
    }

    
    drawBackground(vis:MaterialVisualizer, ctx)
    {
        let col = vis.inkFriendly ? "#FFFFFF" : this.getTypeData().colorBG;
        fillCanvas(ctx, col);
    }

    drawContent(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.resLoader.getResource("token_types");
        const data = this.getTypeData();
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
}