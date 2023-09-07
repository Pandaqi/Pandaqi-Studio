export default (ctx:CanvasRenderingContext2D, x:number, y:number, rot:number, callback:Function) =>
{
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    callback();

    ctx.restore();
}
