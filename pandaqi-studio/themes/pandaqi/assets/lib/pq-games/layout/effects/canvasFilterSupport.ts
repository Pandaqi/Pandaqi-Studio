// Safari (up to at least Safari 18) exposes `ctx.filter` but never applies it, so testing the property
// string says nothing. The only reliable test is to draw one pixel and see whether it was filtered.
let cachedFilterSupport:boolean = null;

export const canvasSupportsFilters = () : boolean =>
{
    if(cachedFilterSupport !== null) { return cachedFilterSupport; }
    try
    {
        const source = document.createElement("canvas");
        source.width = 1;
        source.height = 1;
        const sourceCtx = source.getContext("2d");
        sourceCtx.fillStyle = "#FF0000";
        sourceCtx.fillRect(0, 0, 1, 1);

        const target = document.createElement("canvas");
        target.width = 1;
        target.height = 1;
        const targetCtx = target.getContext("2d");
        targetCtx.filter = "grayscale(1)";
        targetCtx.drawImage(source, 0, 0);

        const pixel = targetCtx.getImageData(0, 0, 1, 1).data;
        cachedFilterSupport = Math.abs(pixel[0] - pixel[1]) <= 4 && Math.abs(pixel[1] - pixel[2]) <= 4;
    }
    catch(e)
    {
        cachedFilterSupport = false;
    }
    return cachedFilterSupport;
}

// Runs a per-pixel transform on a canvas. Used only when canvas filters are unavailable, so this replaces
// a filter and never runs next to it. A tainted canvas (cross-origin image) keeps its original colours
// rather than breaking the generation.
export const applyCanvasPixelEffect = (ctx:CanvasRenderingContext2D, transform:(pixels:Uint8ClampedArray, index:number) => void) =>
{
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if(w <= 0 || h <= 0) { return; }

    try
    {
        const imageData = ctx.getImageData(0, 0, w, h);
        const pixels = imageData.data;
        for(let i = 0; i < pixels.length; i += 4)
        {
            if(pixels[i + 3] <= 0) { continue; } // fully transparent pixels have no colour to change
            transform(pixels, i);
        }
        ctx.putImageData(imageData, 0, 0);
    }
    catch(e)
    {
        // security error from a tainted canvas: leave the content as it is
    }
}
