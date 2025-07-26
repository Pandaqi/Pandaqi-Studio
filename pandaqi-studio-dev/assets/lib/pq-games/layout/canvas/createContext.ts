import Point from "js/pq_games/tools/geometry/point"
import createCanvas from "./createCanvas"

interface NewContextParams
{
    alpha?:boolean
    willReadFrequently?:boolean
    antialias?: boolean
    width?:number
    height?:number
    size?:Point
}

export default (params:NewContextParams = {}) : CanvasRenderingContext2D =>
{
    const contextParams = { 
        willReadFrequently: true,
        alpha: true,
        antialias: true
    };
    Object.assign(contextParams, params);
    const ctx = createCanvas(params).getContext("2d", contextParams) as CanvasRenderingContext2D;
    ctx.imageSmoothingQuality = "low";
    ctx.imageSmoothingEnabled = false;
    return ctx;
}
