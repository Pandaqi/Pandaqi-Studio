import Point from "js/pq_games/tools/geometry/point";
import createContext from "../canvas/createContext";
import LayoutOperation from "../layoutOperation";
import convertCanvasToImage from "../canvas/convertCanvasToImage";
import ResourceImage from "../resources/resourceImage";

interface PatternizeParams
{
    dims:Point|number, // total size
    num:Point|number, // number of icons in each direction
    size:Point|number, // how much of the available icon space the icon actually takes up (so usually <1.0)
    resource:ResourceImage, // which image to actually draw
    frame?:number, // optional, 0 by default
}

export default async (params:PatternizeParams) =>
{
    const dims = new Point(params.dims);
    const num = new Point(params.num);
    const size = new Point(params.size);
    const resourceInput = params.resource;
    const frame = params.frame ?? 0;

    const distBetweenIcons = dims.div(num);
    const iconSize = size.scale(distBetweenIcons);

    const ctx = createContext({ size: new Point(dims) });
    for(let x = 0; x < num.x; x++)
    {
        for(let y = 0; y < num.y; y++)
        {
            const pos = new Point(x,y).scaleFactor(distBetweenIcons);
            const op = new LayoutOperation({
                frame: frame,
                translate: pos,
                dims: iconSize,
                pivot: new Point(0.5),
            })
            await resourceInput.toCanvas(ctx, op);
        }
    }

    const img = await convertCanvasToImage(ctx.canvas);
    const resourceOutput = new ResourceImage(img);
    return resourceOutput;
}