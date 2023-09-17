import smoothPath from "js/pq_games/tools/geometry/paths/smoothPath"

export default class LineVisualizer
{
    constructor() {}
    draw(config)
    {
        this.drawGridPoints(config);
        this.drawLines(config);
    }
    
    drawGridPoints(config)
    {
        const ctx = config.ctx;
        ctx.fillStyle = config.tiles.gridPointColor;
        for(const p of config.gridPoints)
        {
            let r = config.tiles.gridPointSize;
            if(p.isOnEdge()) { r *= config.tiles.gridPointEdgeSizeFactor; }

            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawLines(config)
    {
        const ctx = config.ctx;
        const betweenDotRadius = config.randomWalk.enhancements_v2.dotsBetweenRadius * config.sizeGeneratorSquare;
        const subGridDist = config.shape.getDistToNeighbour(config.tiles.gridResolution);

        const gen = config.generator;
        const randomWalks = gen.getLines();

        ctx.save();
        for(const randomWalkType of config.randomWalk.typeOrder)
        {
            const noLineOfThisType = (!(randomWalkType in randomWalks)) || randomWalks[randomWalkType].length <= 0;
            if(noLineOfThisType) { continue; }

            let strokeStyle = config.randomWalk.colors[randomWalkType];
            if(config.inkFriendly) { strokeStyle = config.randomWalk.colorsInkfriendly[randomWalkType]; }
            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = strokeStyle;

            const lineWidth = config.randomWalk.lineWidths[randomWalkType];
            ctx.lineWidth = lineWidth;
            ctx.shadowColor = config.randomWalk.shadowColor || "#000000";
            ctx.shadowBlur = config.randomWalk.shadowBlur * config.sizeGeneratorSquare;

            const randomWalkList = randomWalks[randomWalkType];
            for(const randomWalk of randomWalkList)
            {
                const points = randomWalk.getPoints();
                const params = { path: points, resolution: 20 }
                let smoothedPoints = points;
                if(config.randomWalk.smooth) { smoothedPoints = smoothPath(params); }

                let path = new Path2D();
                let pathFill = new Path2D();

                // hairs
                const hairs = randomWalk.getHairs();
                for(const hair of hairs)
                {
                    path.moveTo(hair.start.x, hair.start.y);
                    path.lineTo(hair.end.x, hair.end.y);
                }

                // between dots
                const dotsBetween = randomWalk.getDotsBetween();
                for(const dot of dotsBetween)
                {
                    pathFill.arc(dot.x, dot.y, betweenDotRadius, 0, 2*Math.PI, false);
                }

                // attached shapes
                const shapesAttached = randomWalk.getShapesAttached();
                const shapesAttachedRadius = 0.33*subGridDist;
                for(const shape of shapesAttached)
                {
                    if(shape.type == "circle") {
                        const counterClockwise = Math.random() <= 0.5;
                        pathFill.moveTo(shape.pos.x, shape.pos.y);
                        pathFill.arc(shape.pos.x, shape.pos.y, shapesAttachedRadius, shape.angleStart, shape.angleEnd, counterClockwise);
                    } else {
                        for(let i = 0; i < shape.points.length; i++)
                        {
                            const p = shape.points[i];
                            if(i == 0) { pathFill.moveTo(p.x, p.y); }
                            else { pathFill.lineTo(p.x, p.y); }
                        }
                    }
                }

                // main path
                for(let i = 0; i < (smoothedPoints.length-1); i++) 
                {
                    const p1 = smoothedPoints[i];
                    const p2 = smoothedPoints[i + 1];
                    if(i == 0) { path.moveTo(p1.x, p1.y); }
                    else { path.lineTo(p1.x, p1.y); }
                    path.lineTo(p2.x, p2.y);
                }
                ctx.fill(pathFill);
                ctx.stroke(path);
            }
        }
        ctx.restore();
    }
}