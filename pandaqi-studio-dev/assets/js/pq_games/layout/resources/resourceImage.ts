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

interface FrameData {
    xIndex: number,
    yIndex: number,
    x: number,
    y: number,
    width: number,
    height: number
}

export { ResourceImage, ImageLike, CanvasLike }
export default class ResourceImage extends Resource
{
    img : HTMLImageElement;
    size : Point; // can't be set from outside, calculated internally
    frameDims : Point;
    frameSize : Point;
    frame: number;
    frames : HTMLImageElement[];

    constructor(imageData : HTMLImageElement = null, params:any = {})
    {
        super()

        this.img = imageData;
        this.frameDims = new Point(params.frames ?? new Point(1,1));
        if(!this.img) {
            this.frameDims = new Point();
            this.frames = [];
            return;
        }

        const singleFrame = this.frameDims.x*this.frameDims.y == 1;
        if(singleFrame) { this.frames = [this.img]; }

        this.refreshSize();
    }
    
    clone(deep = false) : ResourceImage
    {
        const img = new ResourceImage();
        img.fromResourceImage(this, deep);
        return img;
    }

    /* The `to` functions */
    async toCanvas(canv:CanvasLike = null, op:LayoutOperation = new LayoutOperation())
    {
        if(op.dims.length() <= 0.003) { op.dims = this.size.clone(); }
        op.resource = this;
        op.frame = op.frame ?? this.frame;
        return await op.applyToCanvas(canv);
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

    // @TODO
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

    async cacheFrames()
    {
        const canvases = [];
        for(let x = 0; x < this.frameDims.x; x++)
        {
            for(let y = 0; y < this.frameDims.y; y++)
            {
                const frame = x + y*this.frameDims.x;
                const data = this.getFrameData(frame);
                const ctx = createContext({ size: new Point(data.width, data.height )});
                ctx.drawImage(
                    this.img, 
                    data.x, data.y, data.width, data.height, 
                    0, 0, data.width, data.height
                )

                canvases[frame] = ctx.canvas;
            }
        }

        this.frames = await convertCanvasToImageMultiple(canvases, true);
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

    getImageFrameAsResource(num:number) : ResourceImage
    {
        const img = this.getImageFrame(num);
        return new ResourceImage(img);
    }

    getImageFrame(num:number) : HTMLImageElement
    {
        return this.frames[num];
    }

    isSingleFrame()
    {
        return this.frames.length == 1;
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

    addFrame(img:HTMLImageElement)
    {
        this.frames.push(img);
        this.frameDims.x += 1;
        if(this.frameDims.y <= 0) { this.frameDims.y = 1; }
        this.refreshSize();
    }

    swapFrame(idx:number, img:HTMLImageElement)
    {
        this.frames[idx] = img;
        return this;
    }

    swapFrames(newFrames:HTMLImageElement[])
    {
        if(newFrames.length != this.frames.length) { return console.error("Can't swap frames if number of them doesn't match"); }
        this.frames = newFrames;
        return this;
    }

    // @TODO: not truly unique if you load the same image multiple times, but why'd you do that?
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