import applyPaths from "../helpers/applyPaths"

export default (ctx:CanvasRenderingContext2D, params:Record<string,any>) =>
{
    params.points = params.points || [];

    ctx.beginPath();
    for(const p of params.points)
    {
        ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    applyPaths(ctx, params);
}