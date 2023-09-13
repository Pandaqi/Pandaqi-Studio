export default (ctx:CanvasRenderingContext2D|HTMLCanvasElement, color:string) =>
{
    if(ctx instanceof HTMLCanvasElement) { ctx = ctx.getContext("2d"); }
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}