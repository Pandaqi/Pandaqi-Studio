import Point from "./shapes/point"
import PointNonPhotomone from "js/pq_games/tools/geometry/point"
import { PHOTOMONE_TOKENS } from "./dict"
import CONFIG from "./config"
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import RandomWalk from "./tools/randomWalk";
import RandomWalkPathfind from "./tools/randomWalkPathfind";

export default class Token {
    ctx: CanvasRenderingContext2D;
    id: number;
    type: string;
    typeData: any;
    size: Point;
    sizeSquare: number;
    radius: number;
    centerPos: Point;
    grid: any;
    randomWalks: (RandomWalk|RandomWalkPathfind)[];
    gridPoints: Point[];

    getCanvas() { return this.ctx.canvas; }
    constructor(id:number)
    {
        this.id = id;
        this.type = CONFIG.tokens.types[id];
        this.typeData = PHOTOMONE_TOKENS[this.type];
        this.setupCanvas();

        if(CONFIG.tokens.debug) { document.body.appendChild(this.getCanvas()); }
    }

    setupCanvas()
    {
        const size = CONFIG.tokens.sizeResult;
        this.size = new Point(size.x, size.y);
        this.sizeSquare = Math.min(size.x, size.y);
        this.radius = 0.5*this.sizeSquare;
        this.centerPos = new Point(0.5*size.x, 0.5*size.y);
        this.ctx = createContext({ width: size.x, height: size.y, alpha: true, willReadFrequently: false });
		this.ctx.clearRect(0, 0, size.x, size.y);
    }

    async draw()
    {
        await this.visualizeSprite();
        this.visualizeGrid();
        return this.getCanvas();
    }

    async visualizeSprite()
    {
        const ctx = this.ctx;
        const res = CONFIG.resLoader.getResource("tokens");
        const canvOp = new LayoutOperation({
            pos: new PointNonPhotomone(this.centerPos.x, this.centerPos.y),
            size: new PointNonPhotomone(this.radius*2),
            frame: this.typeData.frame,
            pivot: new PointNonPhotomone(0.5)
        });
        await res.toCanvas(this.ctx, canvOp);
    }

    visualizeGrid()
    {
        if(!this.grid) { return; }

        const ctx = this.ctx;
        const tokenFactor = 0.4; // @TODO: move to general config

        // first add a clip, so nothing is drawn outside of the circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.centerPos.x, this.centerPos.y, this.radius, 0, 2*Math.PI, false);
        ctx.clip();

        // draw all the random walks
        ctx.strokeStyle = CONFIG.randomWalk.color;
        ctx.lineWidth = CONFIG.randomWalk.lineWidth * tokenFactor;

        for(const randomWalk of this.randomWalks)
        {
            const points = randomWalk.getPoints();
            for(let i = 0; i < (points.length-1); i++) 
            {
                ctx.beginPath();
                const p1 = points[i];
                const p2 = points[i + 1];
                ctx.lineTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }

        // now simply draw all the points as circles
        ctx.fillStyle = CONFIG.tiles.gridPointColor;
        for(const p of this.gridPoints)
        {
            let r = CONFIG.tiles.gridPointSize;
            if(p.isOnEdge()) { r *= CONFIG.tiles.gridPointEdgeSizeFactor; }
            r *= tokenFactor;

            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}