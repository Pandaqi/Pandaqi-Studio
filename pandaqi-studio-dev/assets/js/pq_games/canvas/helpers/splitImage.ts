import convertCanvasToImage from "./convertCanvasToImage"

export default async (img:HTMLImageElement, params:Record<string,any> = {}) => 
{
    if(!params.split) { return [img]; }

    const cols = params.cols || 2;
    const rows = params.rows || 2; 
    const totalParts = cols * rows;
    const promises = [];

    for(var i = 0; i < totalParts; i++) {
        var x = i % cols;
        var y = Math.floor(i / cols);

        let canv = document.createElement('canvas');
        canv.width = img.naturalWidth;
        canv.height = img.naturalHeight;

        const chunkX = canv.width / cols;
        const chunkY = canv.height / rows;

        // MAGIC HAPPENS HERE => this slices part of the image and draws it onto the canvas
        canv.getContext('2d').drawImage(
            img, 
            x*chunkX, y*chunkY, chunkX, chunkY, 
            0, 0, canv.width, canv.height
        )

        const loadPromise = convertCanvasToImage(canv);
        promises.push(loadPromise);
    }

    const arr = await Promise.all(promises);
    return arr;
}