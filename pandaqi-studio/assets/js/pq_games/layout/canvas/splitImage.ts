import Point from "js/pq_games/tools/geometry/point";
import convertCanvasToImage from "./convertCanvasToImage"
import createCanvas from "./createCanvas";

interface SplitParams
{
	splitDims?: Point|string
}

// Dimensions can come in either a Point or a string like "1x1"
// dimsToggle is legacy support for the splitBoard checkbox that only goes on/off (no split, 2x2 split)
const readSplitDims = (dims, dimsToggle = null) =>
{
    if(dimsToggle) { dims = new Point(2,2); } 

    if(!dims) { return new Point(1,1); }
    if(dims instanceof Point) { return dims; }
    
    const newDimsArray = (dims as string).split("x");
    if(newDimsArray.length != 2) { console.error("Can't split canvas with dimensions: ", dims); return new Point(1,1); };
    const newDims = new Point(parseInt(newDimsArray[0]), parseInt(newDimsArray[1]));
    if(isNaN(newDims.x) || isNaN(newDims.y)) { console.error("Invalid dimensions for canvas split: ", newDims); return new Point(1,1); }
    return newDims;
}

export { readSplitDims }
export default async (img:HTMLImageElement, params:SplitParams = {}) : Promise<HTMLImageElement[]> => 
{
    let dims = readSplitDims(params.splitDims);
    const mustSplit = dims.x > 1 || dims.y > 1;
    if(!mustSplit) { return [img]; }

    const cols = dims.x ?? 2;
    const rows = dims.y ?? 2; 
    const totalParts = cols * rows;
    
    const promises = [];
    for(var i = 0; i < totalParts; i++) {
        var x = i % cols;
        var y = Math.floor(i / cols);

        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const chunkX = width / cols;
        const chunkY = height / rows;

        let canv = createCanvas({ size: new Point(chunkX, chunkY) });
        
        // MAGIC HAPPENS HERE => this slices part of the image and draws it onto the canvas
        const ctx = canv.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img, 
            x*chunkX, y*chunkY, chunkX, chunkY, 
            0, 0, canv.width, canv.height
        )

        const loadPromise = convertCanvasToImage(canv);
        promises.push(loadPromise);
    }

    return await Promise.all(promises);
}