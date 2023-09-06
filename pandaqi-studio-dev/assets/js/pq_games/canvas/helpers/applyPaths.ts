export default (ctx:CanvasRenderingContext2D, params:Record<string,any>) =>
{
    if(params.color) 
    { 
        ctx.fillStyle = params.color;
        ctx.fill();
    }

    if(params.stroke)
    {
        ctx.strokeStyle = params.stroke;
        ctx.lineWidth = params.strokeWidth ?? 1;
        ctx.stroke();
    }
}