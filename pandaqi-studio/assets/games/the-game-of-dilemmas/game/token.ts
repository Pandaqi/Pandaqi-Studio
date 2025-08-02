import createContext from "js/pq_games/layout/canvas/createContext";
import { TOKEN_TYPES, TokenType } from "../shared/dict";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Point from "js/pq_games/tools/geometry/point";
import { CONFIG } from "../shared/config";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";

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
        this.drawOutline(vis, ctx);
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
        const iconDims = new Point(CONFIG.cards.token.iconSize * vis.sizeUnit);

        const resOp = new LayoutOperation({
            frame: frame,
            pos: vis.center,
            size: iconDims,
            effects: vis.inkFriendlyEffect,
            pivot: Point.CENTER
        });
        group.add(res, resOp);
    }

    drawOutline(vis:MaterialVisualizer, ctx)
    {
        const outlineSize = CONFIG.cards.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.cards.outline.color, outlineSize);
    }
}