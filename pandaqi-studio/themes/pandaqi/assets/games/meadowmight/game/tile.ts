
import { MaterialVisualizer, createContext, fillCanvas, rangeInteger, LayoutOperation, Vector2, strokeCanvas } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { TILE_TYPES, ASSETS } from "../shared/dict";

export default class Tile
{
    type: string; // this is a key from the TILE_TYPES dict
    sheep: number;
    player: number;
    special: string;

    constructor(tp: string, shp: number = 0, plyr:number = -1)
    {
        this.type = tp;
        this.sheep = shp;
        this.player = plyr;
        this.special = null;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        await this.drawBackground(vis, ctx);
        await this.drawFences(vis, ctx);
        await this.drawIllustration(vis, ctx);
        return ctx.canvas;
    }

    async drawBackground(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D)
    {
        if(vis.inkFriendly) { fillCanvas(ctx, "#FFFFFF"); return; }

        const res = vis.resLoader.getResource("assets");
        const frameVariation = rangeInteger(0,3);
        const frame = this.getFrame("grass", frameVariation);
        const op = new LayoutOperation({
            size: vis.size,
            frame: frame
        })

        await res.toCanvas(ctx, op);
    }

    async drawFences(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D)
    {
        const fenceData = TILE_TYPES[this.type].fences.slice();

        const res = vis.resLoader.getResource("assets");
        const frameVariation = this.useUniqueFences() ? 0 : rangeInteger(1,2);
        const frame = this.getFrame("fence", frameVariation);
        const size = vis.size.clone().scale(vis.get("tiles.fences.scale")[frameVariation]);
        const edgeOffset = vis.get("tiles.fences.edgeOffset[frameVariation]") * vis.sizeUnit;
        const op = new LayoutOperation({
            size: size,
            frame: frame,
            pivot: Vector2.CENTER,
            effects: vis.inkFriendlyEffect,
        })

        const positions = [
            new Vector2(vis.center.x, edgeOffset),
            new Vector2(vis.size.x - edgeOffset, vis.center.y),
            new Vector2(vis.center.x, vis.size.y - edgeOffset),
            new Vector2(edgeOffset, vis.center.y)
        ]

        for(let i = 0; i < fenceData.length; i++)
        {
            if(!fenceData[i]) { continue; }

            op.pos = positions[i];
            op.rot = i * 0.5 * Math.PI;

            // this keeps their shaded side semi-consistent
            op.flipX = (i == 1 || i == 2);

            await res.toCanvas(ctx, op);
        }
    }

    async drawIllustration(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D)
    {
        let numIllustrations = this.sheep;
        if(this.isSpecial()) { numIllustrations = 1; }

        if(numIllustrations <= 0) { return; }

        let res = vis.resLoader.getResource("assets");
        const frameVariation = rangeInteger(0,3);
        let frame = this.getFrame("sheep", frameVariation);

        if(this.isSpecial()) { frame = this.getFrame(this.special); }
        if(this.isPlayer())
        {
            res = vis.resLoader.getResource("player_sheep");
            frame = this.player;
        }

        let positions = [vis.center];
        let size = new Vector2(vis.get("tiles.sheep.scale") * vis.sizeUnit);
        if(numIllustrations == 2) {
            size.scale(0.5);
            positions = [
                vis.center.clone().sub(size),
                vis.center.clone().add(size)
            ]
        } else if(numIllustrations == 3) {
            positions = [
                vis.center.clone().sub(new Vector2(2*size.x, 2*size.y)),
                vis.center.clone().add(new Vector2(0, 2*size.y)),
                vis.center.clone().add(new Vector2(2*size.x, 0))
            ];
            size.scale(0.33);
        }

        for(let i = 0; i < numIllustrations; i++)
        {
            const rot = rangeInteger(0,8)*(Math.PI*2/8);
            const op = new LayoutOperation({
                frame: frame,
                pos: positions[i],
                size: size,
                rot: rot,
                pivot: Vector2.CENTER,
                effects: vis.inkFriendlyEffect
            })
    
            await res.toCanvas(ctx, op);
        }
    }

    getFrame(type:string, variation = 0)
    {
        return ASSETS[type].frame + variation*4;
    }

    isPlayer()
    {
        return this.player >= 0;
    }

    isSpecial()
    {
        return this.special != null;
    }

    useUniqueFences()
    {
        return this.isPlayer() || this.isSpecial();
    }
}