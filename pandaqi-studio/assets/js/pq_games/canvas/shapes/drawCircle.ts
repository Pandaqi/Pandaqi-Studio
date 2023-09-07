import applyPaths from "../helpers/applyPaths"

export default (ctx:CanvasRenderingContext2D, params:Record<string,any>) => 
{
    params.pos = params.pos || { x: 0, y: 0 };
    params.radius = params.radius || 10;

    ctx.beginPath();
    ctx.arc(params.pos.x, params.pos.y, params.radius, 0, 2*Math.PI, false);
    applyPaths(ctx, params);
}