export default (ctx:CanvasRenderingContext2D, color:string, width:number) =>
{
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}