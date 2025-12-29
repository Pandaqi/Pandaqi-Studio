import { shuffle } from "lib/pq-games";

export default class LinesAndPixelsVisualizer
{
    colors: string[]
    
    constructor() {}
    draw(config)
    {
        const possibleColors = config.simple.colors.slice();
        shuffle(possibleColors);
        this.colors = possibleColors;

        this.drawBackground(config);
        this.drawPixels(config);
        this.drawLines(config);
        this.drawGridPoints(config);
    }

    drawBackground(config)
    {
        const ctx = config.ctx;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, config.size.x, config.size.y);
    }
    
    drawGridPoints(config)
    {
        const ctx = config.ctx;
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        let r = config.tiles.gridPointSize * config.simple.gridPointScalar;
        for(const p of config.gridPoints)
        {
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawLines(config)
    {
        const ctx = config.ctx;
        const gen = config.generator;

        ctx.strokeStyle = this.colors[0];
        ctx.lineWidth = config.simple.lineWidth * config.sizeSquare;

        const lines = gen.getLines();
        for(const l of lines)
        {
            ctx.moveTo(l.getStart().x, l.getStart().y);
            ctx.lineTo(l.getEnd().x, l.getEnd().y);
            ctx.stroke();
        }
    }

    drawPixels(config)
    {
        const ctx = config.ctx;
        const gen = config.generator;

        const pixels = gen.getPixels();
        for(const p of pixels)
        {
            ctx.fillStyle = this.colors[p.colorNum];
            ctx.fillRect(p.x, p.y, p.width, p.height);
        }
    }

}