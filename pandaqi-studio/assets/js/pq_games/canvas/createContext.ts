import createCanvas from "./createCanvas"

export default (params = {}) : CanvasRenderingContext2D =>
{
    const contextParams = { 
        willReadFrequently: true,
        alpha: true,
    };
    Object.assign(contextParams, params);
    return createCanvas(params).getContext("2d", contextParams) as CanvasRenderingContext2D;
}
