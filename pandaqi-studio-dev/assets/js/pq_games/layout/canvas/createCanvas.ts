import Point from "js/pq_games/tools/geometry/point"

interface NewCanvasParams
{
    width?:number
    height?:number
    size?:Point
    alpha?:boolean
}

export default (params:NewCanvasParams = {}) : HTMLCanvasElement =>
{
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    if(params.size) { 
        params.width = params.size.x;
        params.height = params.size.y;
    }

    Object.assign(canvas, params);
    return canvas;
}