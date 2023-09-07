export default (canvas:HTMLCanvasElement) : Promise<HTMLImageElement> =>
{
    let image = new Image();
    image.src = canvas.toDataURL();

    return new Promise((resolve, reject) => {
        image.onload = function() {
            resolve(image);
        };
    })
}