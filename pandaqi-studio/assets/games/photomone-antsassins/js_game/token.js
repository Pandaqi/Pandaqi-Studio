import Point from "./shapes/point"
import { PHOTOMONE_TOKENS } from "./gameDictionary"
import Canvas from "js/pq_games/canvas/main"

export default class Token {
    getCanvas() { return this.ctx.canvas; }
    constructor(config, id)
    {
        this.id = id;
        this.config = config;
        this.type = config.tokens.types[id];
        this.typeData = PHOTOMONE_TOKENS[this.type];
        this.setupCanvas();
        this.visualize();

        if(config.tokens.debugging) { document.body.appendChild(this.getCanvas()); }
    }

    setupCanvas()
    {
        const size = this.config.tokens.size;
        this.size = size;
        this.sizeSquare = Math.min(size.x, size.y);
        this.radius = 0.5*this.sizeSquare;
        this.centerPos = new Point(0.5*size.x, 0.5*size.y);
        this.ctx = Canvas.createNewContext({ width: size.x, height: size.y, alpha: true, willReadFrequently: false });
		this.ctx.clearRect(0, 0, size.x, size.y);
    }

    visualize()
    {
        this.visualizeSprite();
        this.visualizeGrid();
    }

    visualizeSprite()
    {
        const ctx = this.ctx;
        const params = {
            id: "tokens",
            pos: this.centerPos.clone(),
            size: { width: this.radius*2, height: this.radius*2 },
            frame: this.typeData.frame,
        }
        Canvas.addResourceToContext(ctx, this.config.resLoader, params);
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
        ctx.strokeStyle = this.config.randomWalk.color;
        ctx.lineWidth = this.config.randomWalk.lineWidth * tokenFactor;

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
        ctx.fillStyle = this.config.tiles.gridPointColor;
        for(const p of this.gridPoints)
        {
            let r = this.config.tiles.gridPointSize;
            if(p.isOnEdge()) { r *= this.config.tiles.gridPointEdgeSizeFactor; }
            r *= tokenFactor;

            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}