import Point from "js/pq_games/tools/geometry/point";
import convertCanvasToImage from "./convertCanvasToImage"

interface SplitParams
{
	split?: boolean
	splitDims?: Point
}

export default async (img:HTMLImageElement, params:SplitParams = {}) => 
{
    if(!params.split) { return [img]; }

    const cols = params.splitDims.x ?? 2;
    const rows = params.splitDims.y ?? 2; 
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

    return await Promise.all(promises);
}