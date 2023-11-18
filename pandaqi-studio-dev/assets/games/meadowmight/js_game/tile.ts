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
    ctx: CanvasRenderingContext2D;
    type: string; // this is a key from the TILE_TYPES dict
    sheep: number;
    player: number;
    wolf: boolean;

    constructor(tp: string, shp: number = 0, plyr:number = -1)
    {
        this.type = tp;
        this.sheep = shp;
        this.player = plyr;
    }

    async drawForRules(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;
        // @TODO;
        
        return this.getCanvas();
    }

    getCanvas() { return this.ctx.canvas; }
    async draw(vis:Visualizer)
    {
        const ctx = createContext({ size: vis.size });
        this.ctx = ctx;

        await this.drawBackground(vis);
        await this.drawFences(vis);
        await this.drawIllustration(vis);
        this.drawOutline(vis);

        return this.getCanvas();
    }

    async drawBackground(vis:Visualizer)
    {
        const res = vis.resLoader.getResource("assets");
        const frame = ASSETS.grass.frame;
        const op = new LayoutOperation({
            dims: vis.size,
            frame: frame
        })

        await res.toCanvas(this.ctx, op);
    }

    async drawFences(vis:Visualizer)
    {
        const fenceData = TILE_TYPES[this.type].fences.slice();

        const res = vis.resLoader.getResource("assets");
        const frame = ASSETS.fence.frame;
        const dims = vis.size.clone().scale(CONFIG.tiles.fences.scale);
        const edgeOffset = CONFIG.tiles.fences.edgeOffset * vis.sizeUnit;
        const op = new LayoutOperation({
            dims: dims,
            frame: frame,
            pivot: Point.CENTER
        })

        const positions = [
            new Point(vis.center.x, edgeOffset),
            new Point(vis.size.x - edgeOffset, vis.center.y),
            new Point(vis.center.x, vis.size.y - edgeOffset),
            new Point(0, vis.center.y)
        ]

        for(let i = 0; i < fenceData.length; i++)
        {
            if(!fenceData[i]) { continue; }

            op.translate = positions[i];
            op.rotation = i * 0.5 * Math.PI;
            await res.toCanvas(this.ctx, op);
        }
    }

    async drawIllustration(vis:Visualizer)
    {
        if(this.sheep <= 0) { return; }

        let res = vis.resLoader.getResource("assets");
        let frame = this.wolf ? ASSETS.wolf.frame : ASSETS.sheep.frame;

        const showPlayerSheep = this.player >= 0;
        if(showPlayerSheep)
        {
            res = vis.resLoader.getResource("player_sheep");
            frame = this.player;
        }

        let positions = [vis.center];
        let dims = new Point(CONFIG.tiles.sheep.scale * vis.sizeUnit);
        if(this.sheep == 2) {
            dims.scale(0.5);
            positions = [
                vis.center.clone().sub(dims),
                vis.center.clone().add(dims)
            ]
        } else if(this.sheep == 3) {
            positions = [
                vis.center.clone().sub(new Point(2*dims.x, 2*dims.y)),
                vis.center.clone().add(new Point(0, 2*dims.y)),
                vis.center.clone().add(new Point(2*dims.x, 0))
            ];
            dims.scale(0.33);
        }

        for(let i = 0; i < this.sheep; i++)
        {
            const rotation = rangeInteger(0,8)*(Math.PI*2/8);
            const op = new LayoutOperation({
                frame: frame,
                translate: positions[i],
                dims: dims,
                rotation: rotation,
                pivot: Point.CENTER,
            })
    
            await res.toCanvas(this.ctx, op);
        }
    }

    drawOutline(vis:Visualizer)
    {
        const outlineSize = CONFIG.tiles.outline.size * vis.sizeUnit;
        strokeCanvas(this.ctx, CONFIG.tiles.outline.color, outlineSize);
    }
}