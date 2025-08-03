import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Path from "js/pq_games/tools/geometry/paths/path";
import takeBitesOutOfPath from "js/pq_games/tools/geometry/paths/takeBitesOutOfPath";
import { CONFIG } from "../shared/config";
import { CATEGORIES, ELEMENTS } from "../shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import Line from "js/pq_games/tools/geometry/line";
import Bounds from "js/pq_games/tools/numbers/bounds";

export const cacheVisualizerData = async (vis:MaterialVisualizer) =>
{
    const alreadyCached = CONFIG.multiTypeImageResource;
    if(alreadyCached) { return; }

    // convert image icons into ones with a random cutout
    await bakeCutoutInto(vis, "icons");
    await bakeCutoutInto(vis, "icons_actions");

    if(CONFIG._settings.multiType.value)
    {
        await createMultiTypeIcons(vis, "icons");
    }
}

const bakeCutoutInto = async (vis: MaterialVisualizer, key:string) =>
{
    const iconRes = vis.getResource(key) as ResourceImage;
    const numFrames = iconRes.countFrames();
    let newCanvases = [];
    
    const bgTypes = ["red", "blue", "green", "purple"];
    const frameSize = 512;
    const biteSize = { min: 0.05*frameSize, max: 0.15*frameSize };
    const isAction = (key == "icons_actions");

    for(let i = 0; i < numFrames; i++)
    {
        const categoryData = CATEGORIES[ bgTypes[Math.floor(i / 4)] ];
        let col = categoryData.color;
        let colPattern = categoryData.colorDark;
        if(CONFIG._settings.defaults.inkFriendly.value) 
        { 
            col = CONFIG._drawing.cards.icon.backgroundInkFriendly; 
            colPattern = CONFIG._drawing.cards.icon.backgroundDarkInkFriendly;
        }

        // grab only this frame
        const img = iconRes.getImageFrameAsResource(i);
        const op = new LayoutOperation();

        // fill background with correct color
        const ctx = createContext({ size: img.size });
        ctx.clip(getFunkyClipPath(img.size, biteSize).toPath2D());
        fillCanvas(ctx, col);

        // if an action, also add a pattern
        if(isAction)
        {
            await addActionPattern(ctx, colPattern);
        }

        const canv = await img.toCanvas(ctx, op);
        newCanvases.push(canv);
    }

    const newFrames = await convertCanvasToImageMultiple(newCanvases, true);
    for(let i = 0; i < numFrames; i++)
    {
        await iconRes.swapFrame(i, newFrames[i]);
    }
}

const addActionPattern = (ctx:CanvasRenderingContext2D, col:string) =>
{
    const numLines = 5;
    const size = new Point(ctx.canvas.width, ctx.canvas.height);
    const op = new LayoutOperation({
        stroke: col,
        strokeWidth: CONFIG._drawing.cards.actionIconPatternStrokeWidth * ctx.canvas.width,
        alpha: CONFIG._drawing.cards.actionIconPatternAlpha,
    })

    let stepSize = size.x / numLines;

    for(let i = -1; i <= (numLines+1); i++)
    {
        const start = new Point(stepSize*i, size.y);
        const end = new Point(stepSize*(i+1), 0);
        const l = new Line(start, end);
        const res = new ResourceShape({ shape: l });
        res.toCanvas(ctx, op);
    }
}

const createMultiTypeIcons = async (vis: MaterialVisualizer, key:string) =>
{
    const res = new ResourceImage();

    // for this spritesheet, we only grab the 4 types actually used in the game
    // (because multityping them, we get 4x4 = 16 icons in total that way)
    const framesUsed = [];

    // given by user, maps main type (e.g. red) to sub type (e.g. fire)
    let elemDict : Record<string,string> = CONFIG.elements;
    for(const [mainType, subType] of Object.entries(elemDict))
    {
        framesUsed.push(ELEMENTS[subType].frame);
    }

    const iconRes = vis.getResource(key) as ResourceImage;
    const newCanvases = [];

    for(let i = 0; i < 4; i++)
    {
        const img1 = iconRes.getImageFrameAsResource(framesUsed[i]);

        for(let j = 0; j < 4; j++)
        {
            // just a triangle from top left
            const clipPath1 = [
                new Point(),
                new Point(img1.size.x, 0),
                new Point(0, img1.size.y)
            ]

            // image 1 is added fully
            const ctx = createContext({ size: img1.size });
            const op1 = new LayoutOperation({
                clip: new Path({ points: clipPath1 })
            })
            img1.toCanvas(ctx, op1);

            // and a triangle from bottom right
            const clipPath2 = [
                new Point(img1.size.x, 0),
                img1.size.clone(),
                new Point(0, img1.size.y)
            ]

            // image 2 is added with a clip so it only shows half (cut diagonally)
            const img2 = iconRes.getImageFrameAsResource(framesUsed[j]);
            const op2 = new LayoutOperation({
                clip: new Path({ points: clipPath2 })
            });

            const canv = img2.toCanvas(ctx, op2);
            newCanvases.push(canv);
        }
    }

    const newFrames = await convertCanvasToImageMultiple(newCanvases, true);
    for(const frame of newFrames)
    {
        await res.addFrame(frame);
    }

    console.log(res);

    CONFIG.multiTypeImageResource = res;
}

const getFunkyClipPath = (size:Point, bounds = { min: 3, max: 6 }) : Path =>
{
    const path = [
        new Point(),
        new Point(size.x, 0),
        new Point(size.x, size.y),
        new Point(0, size.y),
        new Point() // to close it
    ]
    const chunkSize = 0.5*(bounds.min + bounds.max);
    const funkyPath = takeBitesOutOfPath({ path: path, biteBounds: bounds, chunkSize: chunkSize, chunksInterval: new Bounds(6, 11) });
    return new Path({ points: funkyPath });
}
