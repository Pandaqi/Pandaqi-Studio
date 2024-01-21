import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Resource from "./resource"
import Point from "js/pq_games/tools/geometry/point"
import ResourceGradient from "./resourceGradient"
import ResourcePattern from "./resourcePattern"
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"

import ResourceLoader from "./resourceLoader"
import ResourceText from "./resourceText"
import createContext from "../canvas/createContext"

type ImageLike = HTMLImageElement|ResourceImage|ResourceGradient|ResourcePattern
type CanvasLike = HTMLCanvasElement|CanvasRenderingContext2D
type FrameSet = HTMLImageElement[];

interface FrameData {
    xIndex: number,
    yIndex: number,
    x: number,
    y: number,
    width: number,
    height: number
}

class CanvasDrawableLike
{
    val: ResourceImage|HTMLCanvasElement|HTMLImageElement

    constructor(val) { this.val = val }
    getImage()
    {
        if(this.val instanceof ResourceImage) { return this.val.getImage(); }
        return this.val;
    }

    getSize()
    {
        if(this.val instanceof ResourceImage) { return this.val.size; }
        if(this.val instanceof HTMLImageElement) { return new Point(this.val.naturalWidth, this.val.naturalHeight); }
        return new Point(this.val.width, this.val.height);
    }
}

export { ResourceImage, ImageLike, CanvasLike, CanvasDrawableLike }
export default class ResourceImage extends Resource
{
    img : HTMLImageElement;
    size : Point; // can't be set from outside, calculated internally
    frameDims : Point;
    frameSize : Point;
    frame: number;
    frames : HTMLImageElement[];

    thumbnails: FrameSet[];
    numThumbnails : number; // how many smaller thumbnails we should cache for each frame (e.g. a 1024x1024 also saves a 512x512 if set to 1)


    constructor(imageData : HTMLImageElement = null, params:any = {})
    {
        super()

        this.frames = [];
        this.thumbnails = [];
        this.numThumbnails = params.numThumbnails ?? 0;
        this.frameDims = new Point();

        if(imageData) { this.fromRawImage(imageData, params); }
    }
    
    clone(deep = false) : ResourceImage
    {
        const img = new ResourceImage();
        img.fromResourceImage(this, deep);
        return img;
    }

    /* The `to` functions */
    toCanvas(canv:CanvasLike = null, op:LayoutOperation = new LayoutOperation())
    {
        if(op.dims.length() <= 0.003) { op.dims = this.size.clone(); }
        op.resource = this;
        op.frame = op.frame ?? this.frame;
        return op.applyToCanvas(canv);
    }

    async toHTML(op:LayoutOperation = new LayoutOperation())
    {
        const frame = op.frame ?? 0;
        const node = this.getImageFrame(frame).cloneNode() as HTMLImageElement;
        node.style.width = "100%";
        node.style.height = "100%";
        
        return await op.applyToHTML(node);
    }

    async toSVG(op:LayoutOperation = new LayoutOperation())
    {
        const elem = document.createElementNS(null, "image");
        elem.setAttribute("href", this.getImage().src);
        return await op.applyToSVG(elem);
    }

    // for getting a new ResourceImage with result after operation applied
    async toResourceImage(op = new LayoutOperation())
    {
        const canv = await this.toCanvas();
        const img = await convertCanvasToImage(canv);
        const resImg = new ResourceImage(img);
        return resImg;
    }

    /* The `from` functions */
    fromResourceImage(r:ResourceImage, deep = false)
    {
        this.img = r.img;
        this.size = deep ? r.size.clone() : r.size;
        this.frameDims = deep ? r.frameDims.clone() : r.frameDims;
        this.frames = deep ? r.frames.slice() : r.frames;
        this.refreshSize();
    }

    fromRawImage(img:HTMLImageElement, params:any = {})
    {
        this.img = img;
        this.frameDims = new Point(params.frames ?? new Point(1,1));
        this.frames = [this.img];
        this.refreshSize();
    }

    // @TODO
    async fromPattern(p:ResourcePattern)
    {
        return new ResourceImage();
    }

    // @TODO
    async fromGradient(g:ResourceGradient)
    {
        return new ResourceImage();
    }

    async fromSVG(elem:SVGImageElement)
    {
        const resLoader = new ResourceLoader();
        resLoader.planLoad("svg_embedded_image", { path: elem.href });
        resLoader.loadPlannedResources();
        const imgRes = resLoader.getResource("svg_embedded_image");
        this.fromResourceImage(imgRes);
    }

    async fromCanvas(canv:HTMLCanvasElement)
    {
        this.img = await convertCanvasToImage(canv);
        this.refreshSize();
        await this.cacheFrames();
        return this;
    }

    // @TODO => would require TextDrawer to draw it to canvas, then convert to image?
    async fromText(text:ResourceText)
    {
        return this
    }

    /* Helpers & Tools */
    refreshSize()
    {
        if(!(this.img instanceof HTMLImageElement)) { return; }

        this.size = new Point().setXY(this.img.naturalWidth, this.img.naturalHeight);
        this.frameSize = new Point().setXY(
            this.size.x / this.frameDims.x,
            this.size.y / this.frameDims.y
        )
    }

    async calculateThumbnails(num:number, mask:number[] = [])
    {
        this.numThumbnails = num;
        await this.cacheThumbnails(mask);
    }

    async cacheThumbnails(mask:number[] = [])
    {
        if(this.numThumbnails <= 0) { return; }

        const num = this.numThumbnails;
        for(let i = 0; i < this.frames.length; i++)
        {
            if(mask.length > 0 && !mask.includes(i)) { continue; }

            const data = this.getFrameData(i);
            const size = new Point(data.width, data.height );

            const canvases = [];
            for(let t = 0; t < num; t++)
            {
                size.div(2);
                const ctx = createContext({ size: size });
                ctx.drawImage(
                    this.img, 
                    data.x, data.y, data.width, data.height, 
                    0, 0, size.x, size.y
                )
                canvases[t] = ctx.canvas;
            }

            this.thumbnails[i] = await convertCanvasToImageMultiple(canvases, true);
        }
    }

    // @NOTE: the ResourceLoader calls this, not our own constructor.
    // Is this a confusing system? Will this lead to trouble later? Perhaps.
    async cacheFrames()
    {
        const canvases = [];
        for(let x = 0; x < this.frameDims.x; x++)
        {
            for(let y = 0; y < this.frameDims.y; y++)
            {
                const frame = x + y*this.frameDims.x;
                const data = this.getFrameData(frame);
                const size = new Point(data.width, data.height );

                const ctx = createContext({ size: size });
                ctx.drawImage(
                    this.img, 
                    data.x, data.y, data.width, data.height, 
                    0, 0, size.x, size.y
                )
                canvases[frame] = ctx.canvas;
            }
        }

        this.frames = await convertCanvasToImageMultiple(canvases, true);

        await this.cacheThumbnails();
    }

    getFrameData(frm:number = 0) : FrameData
    {
        const frameVec = new Point().setXY(
            frm % this.frameDims.x,
            Math.floor(frm / this.frameDims.x)
        )

        return {
            xIndex: frameVec.x,
            yIndex: frameVec.y,
            x: frameVec.x * this.frameSize.x,
            y: frameVec.y * this.frameSize.y,
            width: this.frameSize.x,
            height: this.frameSize.y 
        }
    }

    getCSSUrl() : string
    {
        return "url(" + this.img.src + ")";
    }

    // Ratio is always X:Y (so 2 means twice as WIDE as it is TALL)
    getRatio() : number
    {
        return this.frameSize.x / this.frameSize.y
    }

    getSizeKeepRatio(size:number, axisGiven:string = "x")
    {
        const ratio = this.getRatio();
        if(axisGiven == "x") { return size / ratio; }
        else if(axisGiven == "y") { return size * ratio; }
        return size;
    }

    getImage() : HTMLImageElement 
    { 
        return this.img; 
    }

    getImageFrameAsDrawable(num: number, desiredSize:Point = null)
    {
        return new CanvasDrawableLike(this.getImageFrame(num, desiredSize));
    }

    getImageFrameAsResource(num:number, desiredSize:Point = null) : ResourceImage
    {
        const img = this.getImageFrame(num, desiredSize);
        return new ResourceImage(img);
    }

    getImageFrame(num:number, desiredSize:Point = null) : HTMLImageElement
    {
        const maxSize = this.frameDims.clone();
        let thumbIndex = 0;
        if(desiredSize)
        {
            // find the smallest thumbnail that's still large enough
            // the value 0 is reserved for "original image" ( = "don't use thumbnail at all")
            for(let i = 1; i < this.thumbnails.length + 1; i++)
            {
                maxSize.div(2);
                const becomeTooSmall = maxSize.x < desiredSize.x || maxSize.y < desiredSize.y;
                if(becomeTooSmall) { break; }
                thumbIndex = i;
            }
        }

        if(thumbIndex <= 0) { return this.frames[num]; }
        return this.thumbnails[num][thumbIndex];
    }

    isSingleFrame()
    {
        return this.countFrames() == 1;
    }

    countFrames() : number
    {
        return this.frames.length;
    }

    getFrame() : number
    {
        return this.frame;
    }

    setFrame(f:number)
    {
        this.frame = f;
        return this;
    }

    swapImage(img:HTMLImageElement)
    {
        this.img = img;
        return this;
    }

    async addFrame(img:HTMLImageElement)
    {
        this.frames.push(img);
        this.frameDims.x += 1;
        if(this.frameDims.y <= 0) { this.frameDims.y = 1; }
        this.refreshSize();
        await this.cacheThumbnails([this.countFrames()]);
    }

    async addFrames(imgs:HTMLImageElement[])
    {
        for(const img of imgs)
        {
            await this.addFrame(img);
        }
    }

    async swapFrame(idx:number, img:HTMLImageElement)
    {
        this.frames[idx] = img;
        await this.cacheThumbnails([idx]);
        return this;
    }

    async swapFrames(newFrames:HTMLImageElement[])
    {
        if(newFrames.length != this.frames.length) { return console.error("Can't swap frames if number of them doesn't match"); }
        this.frames = newFrames.slice();
        await this.cacheThumbnails();
        return this;
    }

    // @NOTE: not truly unique if you load the same image multiple times, but why'd you do that?
    getUniqueKey() : string
    {
        const src = this.img.src;
        const srcSplit = src.split("/");
        const fileName = srcSplit[srcSplit.length-1];
        const srcName = fileName.split(".")[0];
        const maxLength = 25;
        const srcTrunc = srcName.slice(0, Math.min(srcName.length, maxLength));
        return srcTrunc
    }
    
    
}