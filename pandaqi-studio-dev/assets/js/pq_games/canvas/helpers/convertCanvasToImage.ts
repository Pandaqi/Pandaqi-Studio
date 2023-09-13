import convertCanvasToImageMultiple from "./convertCanvasToImageMultiple";

export default (canvas:HTMLCanvasElement|HTMLCanvasElement[]) : Promise<HTMLImageElement|HTMLImageElement[]> =>
{
    if(Array.isArray(canvas)) { return convertCanvasToImageMultiple(canvas); }

    let image = new Image();
    image.src = canvas.toDataURL();

    return new Promise((resolve, reject) => {
        image.onload = function() {
            resolve(image);
        };
    })
}