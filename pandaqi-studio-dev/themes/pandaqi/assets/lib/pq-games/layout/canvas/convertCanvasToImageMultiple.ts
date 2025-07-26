import convertCanvasToImage from "./convertCanvasToImage"

// Most of the time, we don't care in what order we receive the image elements
// If you do, set sorted to true
export default async (canvases:HTMLCanvasElement[], sorted = false) : Promise<HTMLImageElement[]> =>
{
    const promises = [];
    for(let i = 0; i < canvases.length; i++)
    {
        const canv = canvases[i];
        canv.dataset.index = i.toString();
        promises.push(convertCanvasToImage(canv));
    }
    const valuesUnsorted = await Promise.all(promises);
    if(!sorted) { return valuesUnsorted; }

    const valuesSorted = [];
    for(const val of valuesUnsorted)
    {
        const idx = parseInt(val.dataset.index);
        valuesSorted[idx] = val;
    }

    return valuesSorted;
}