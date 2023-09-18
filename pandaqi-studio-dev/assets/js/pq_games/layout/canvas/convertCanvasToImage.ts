
export default async (canvas:HTMLCanvasElement) : Promise<HTMLImageElement> =>
{
    let image = new Image();
    image.src = canvas.toDataURL();
    await image.decode();
    image.dataset.index = canvas.dataset.index ?? "0";
    return image;
}