export default class ShapesVisualizer
{
    constructor() {}
    draw(config)
    {
        this.drawShapes(config);
    }

    drawShapes(config)
    {
        const gen = config.generator;
        const ctx = config.ctx;
        const shapes = gen.getShapes();

        for(const shape of shapes)
        {
            ctx.beginPath();
            for(const point of shape.points)
            {
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();

            ctx.fillStyle = shape.fillStyle.toString();
            if(shape.fill) { ctx.fill(); }

            ctx.strokeStyle = shape.strokeStyle.toString();
            if(shape.stroke) { ctx.stroke(); }
        }
    }
}