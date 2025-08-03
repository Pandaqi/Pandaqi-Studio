import Random from "js/pq_games/tools/random/main"

export default class PhotomoneVisualizer
{
    constructor() {}
    draw(config)
    {
        this.drawLines(config);
        this.drawPoints(config);
    }

    drawLines(config)
    {
        const gen = config.generator;
        const ctx = config.ctx;
        const lines = gen.getLines();

        ctx.strokeStyle = config.photomone.strokeStyle || "#000000";
        ctx.lineWidth = (config.photomone.lineWidth || 0.05) * config.sizeSquare;

        for(const line of lines)
        {
            const p1 = line.getStart();
            const p2 = line.getEnd();
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    drawGridPoints(config)
    {
        const ctx = config.ctx;
        let r = config.tiles.gridPointSize;
        for(const p of config.gridPoints)
        {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
            ctx.closePath();
            ctx.fill();

            /* @DEBUGGING
            ctx.fillStyle = "#FF0000";
            ctx.font = "36px Arial";
            ctx.fillText(p.lineIndex, p.x, p.y);
            */
        }
    }

    drawPoints(config)
    {
        // @DEBUGGING
        //this.drawGridPoints(config);

        const gen = config.generator;
        const ctx = config.ctx;       
        const points = gen.getPoints();
        const radius = (config.photomone.pointRadius || 0.05) * config.sizeSquare;
        const possibleColors = config.photomone.colors;

        ctx.fillStyle = config.photomone.fillStyle || "#333333";

        for(const point of points)
        {
            ctx.fillStyle = fromArray(possibleColors).toString();
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, 2*Math.PI);
            ctx.fill();
        }
    }
}