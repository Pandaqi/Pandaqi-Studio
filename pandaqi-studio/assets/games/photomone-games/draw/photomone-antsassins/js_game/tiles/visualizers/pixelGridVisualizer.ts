
export default class PixelGridVisualizer
{
    constructor() {}
    draw(config)
    {
        const gen = config.generator;
        const ctx = config.ctx;
        const size = { x: ctx.canvas.width, y: ctx.canvas.height };
        const cellSize = { 
            x: size.x / gen.getGridSize().x,
            y: size.y / gen.getGridSize().y
        }

        ctx.fillStyle = gen.getBackgroundColor() || "#FFFFFF";
        ctx.fillRect(0, 0, size.x, size.y);

        const grid = gen.getGridFlat();
        for(const cell of grid)
        {
            ctx.save();
            ctx.fillStyle = cell.getColor();
            ctx.globalAlpha = cell.getAlpha();
            const rect = cell.getRect(cellSize)
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            ctx.restore();
        }
    }
}