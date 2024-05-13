
export default (ctx:CanvasRenderingContext2D) =>
{
    // @NOTE (CRUCIAL): ctx.reset() is NOT the same thing, as it also CLEARS the canvas!
    // We only want to reset properties that might have changed
    ctx.globalAlpha = 1.0;
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";
    ctx.resetTransform();
}