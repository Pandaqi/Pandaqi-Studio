import type { Vector2 } from "../../geometry/vector2"

interface NewCanvasParams
{
    width?:number
    height?:number
    size?:Vector2
    alpha?:boolean
    resize?:boolean
}

export const createCanvas = (params:NewCanvasParams = {}) : HTMLCanvasElement =>
{
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    if(params.size) 
    { 
        canvas.width = params.size.x;
        canvas.height = params.size.y;
    }

    if(params.resize)
    {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
    }

    Object.assign(canvas, params);
    return canvas;
}

interface NewContextParams
{
    alpha?:boolean
    // Reading pixels back (getImageData) is only possible on a software canvas, so Chrome moves the
    // whole surface to the CPU for a context created with this flag. It used to be on for EVERY
    // context, including the large temporary canvases the renderer composites through, which made the
    // GPU-backed canvas render on the CPU. Opt in only where pixels are actually read.
    willReadFrequently?:boolean
    antialias?: boolean
    width?:number
    height?:number
    size?:Vector2
}

export const createContext = (params:NewContextParams = {}) : CanvasRenderingContext2D =>
{
    const contextParams:CanvasRenderingContext2DSettings = { 
        willReadFrequently: params.willReadFrequently ?? false,
        alpha: params.alpha ?? true,
    };
    const ctx = createCanvas(params).getContext("2d", contextParams) as CanvasRenderingContext2D;
    ctx.imageSmoothingQuality = "low";
    ctx.imageSmoothingEnabled = false;
    return ctx;
}
