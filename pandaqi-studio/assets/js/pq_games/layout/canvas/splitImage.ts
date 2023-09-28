import Point from "js/pq_games/tools/geometry/point";
import convertCanvasToImage from "./convertCanvasToImage"

interface SplitParams
{
	splitDims?: Point|string
}

export default async (img:HTMLImageElement, params:SplitParams = {}) => 
{
    let dims : Point;
    if(params.splitDims instanceof Point) {
        dims = params.splitDims;
    } else {
        const newDimsArray = (params.splitDims as string).split("x");
        if(newDimsArray.length != 2) { console.error("Can't split canvas with dimensions: ", params.splitDims); return [img]; };
        const newDims = new Point(parseInt(newDimsArray[0]), parseInt(newDimsArray[1]));
        dims = newDims;
    }

    const mustSplit = dims.x > 1 || dims.y > 1;
    if(!mustSplit) { return [img]; }

    const cols = dims.x ?? 2;
    const rows = dims.y ?? 2; 
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