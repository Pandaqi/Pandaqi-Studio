import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import { CONFIG } from "../shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import { ASSETS, TILE_TYPES } from "../shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";

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
        this.drawOutline(vis, ctx);
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
        const size = vis.size.clone().scale(CONFIG._drawing.tiles.fences.scale[frameVariation]);
        const edgeOffset = CONFIG._drawing.tiles.fences.edgeOffset[frameVariation] * vis.sizeUnit;
        const op = new LayoutOperation({
            size: size,
            frame: frame,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect,
        })

        const positions = [
            new Point(vis.center.x, edgeOffset),
            new Point(vis.size.x - edgeOffset, vis.center.y),
            new Point(vis.center.x, vis.size.y - edgeOffset),
            new Point(edgeOffset, vis.center.y)
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
        let size = new Point(CONFIG._drawing.tiles.sheep.scale * vis.sizeUnit);
        if(numIllustrations == 2) {
            size.scale(0.5);
            positions = [
                vis.center.clone().sub(size),
                vis.center.clone().add(size)
            ]
        } else if(numIllustrations == 3) {
            positions = [
                vis.center.clone().sub(new Point(2*size.x, 2*size.y)),
                vis.center.clone().add(new Point(0, 2*size.y)),
                vis.center.clone().add(new Point(2*size.x, 0))
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
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect
            })
    
            await res.toCanvas(ctx, op);
        }
    }

    drawOutline(vis:MaterialVisualizer, ctx:CanvasRenderingContext2D)
    {
        const outlineSize = CONFIG._drawing.tiles.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG._drawing.tiles.outline.color, outlineSize);
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