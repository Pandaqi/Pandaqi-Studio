export default class PixelCell
{
    constructor(x = 0, y = 0, color = "#FF0000")
    {
        this.x = x;
        this.y = y;
        this.alpha = 0.0;
        this.color = color;
    }
    
    getAlpha() { return this.alpha; }
    changeAlpha(da)
    {
        this.alpha = Math.min(Math.max(this.alpha + da, 0.0), 1.0);
    }

    getColor() { return this.color; }
    setColor(c) { this.color = c; }

    getRect(cellSize)
    {
        return {
            x: this.x * cellSize.x,
            y: this.y * cellSize.y,
            w: cellSize.x,
            h: cellSize.y
        }
    }
}