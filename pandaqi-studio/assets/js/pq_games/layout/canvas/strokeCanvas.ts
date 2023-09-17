export default (ctx:CanvasRenderingContext2D|HTMLCanvasElement, color:string, width:number) =>
{
    if(ctx instanceof HTMLCanvasElement) { ctx = ctx.getContext("2d"); }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}