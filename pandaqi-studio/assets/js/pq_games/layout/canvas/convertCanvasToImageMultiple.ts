import convertCanvasToImage from "./convertCanvasToImage"

export default async (canvases:HTMLCanvasElement[]) : Promise<HTMLImageElement[]> =>
{
    const promises = [];
    for(const canv of canvases)
    {
        promises.push(convertCanvasToImage(canv));
    }
    const values = await Promise.all(promises);
    return values;
}