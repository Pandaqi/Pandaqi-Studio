import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import Visualizer from "./visualizer";
import CONFIG from "../js_shared/config";
import strokeCanvas from "js/pq_games/layout/canvas/strokeCanvas";
import { ASSETS, TILE_TYPES } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";


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

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        // @TODO;
        
        return ctx.canvas;
    }

    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        await this.drawBackground(vis, ctx);
        await this.drawFences(vis, ctx);
        await this.drawIllustration(vis, ctx);
        this.drawOutline(vis, ctx);
        return ctx.canvas;
    }

    async drawBackground(vis:Visualizer, ctx:CanvasRenderingContext2D)
    {
        const res = vis.resLoader.getResource("assets");
        const frameVariation = rangeInteger(0,3);
        const frame = this.getFrame("grass", frameVariation);
        const op = new LayoutOperation({
            dims: vis.size,
            frame: frame
        })

        await res.toCanvas(ctx, op);
    }

    async drawFences(vis:Visualizer, ctx:CanvasRenderingContext2D)
    {
        const fenceData = TILE_TYPES[this.type].fences.slice();

        const res = vis.resLoader.getResource("assets");
        const frameVariation = this.useUniqueFences() ? 0 : rangeInteger(1,2);
        const frame = this.getFrame("fence", frameVariation);
        const dims = vis.size.clone().scale(CONFIG.tiles.fences.scale[frameVariation]);
        const edgeOffset = CONFIG.tiles.fences.edgeOffset[frameVariation] * vis.sizeUnit;
        const op = new LayoutOperation({
            dims: dims,
            frame: frame,
            pivot: Point.CENTER
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

            op.translate = positions[i];
            op.rotation = i * 0.5 * Math.PI;

            // this keeps their shaded side semi-consistent
            op.flipX = (i == 1 || i == 2);

            await res.toCanvas(ctx, op);
        }
    }

    async drawIllustration(vis:Visualizer, ctx:CanvasRenderingContext2D)
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
        let dims = new Point(CONFIG.tiles.sheep.scale * vis.sizeUnit);
        if(numIllustrations == 2) {
            dims.scale(0.5);
            positions = [
                vis.center.clone().sub(dims),
                vis.center.clone().add(dims)
            ]
        } else if(numIllustrations == 3) {
            positions = [
                vis.center.clone().sub(new Point(2*dims.x, 2*dims.y)),
                vis.center.clone().add(new Point(0, 2*dims.y)),
                vis.center.clone().add(new Point(2*dims.x, 0))
            ];
            dims.scale(0.33);
        }

        for(let i = 0; i < numIllustrations; i++)
        {
            const rotation = rangeInteger(0,8)*(Math.PI*2/8);
            const op = new LayoutOperation({
                frame: frame,
                translate: positions[i],
                dims: dims,
                rotation: rotation,
                pivot: Point.CENTER,
            })
    
            await res.toCanvas(ctx, op);
        }
    }

    drawOutline(vis:Visualizer, ctx:CanvasRenderingContext2D)
    {
        const outlineSize = CONFIG.tiles.outline.size * vis.sizeUnit;
        strokeCanvas(ctx, CONFIG.tiles.outline.color, outlineSize);
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