import CanvasOperation from "js/pq_games/canvas/canvasOperation"
import Resource from "./resource"
import Point from "js/pq_games/tools/geometry/point"

type ImageLike = HTMLImageElement

interface FrameData {
    xIndex: number,
    yIndex: number,
    x: number,
    y: number,
    width: number,
    height: number
}

export default class ResourceImage extends Resource
{
    img : HTMLImageElement;
    size : Point;
    frameDims : Point;
    frameSize : Point;
    frames : HTMLImageElement[];

    constructor(imageData : HTMLImageElement = new Image(), params:any = {})
    {
        super()

        this.img = imageData;
        this.frameDims = new Point(params.frames ?? new Point(1,1));
        this.refreshSize();
    }
    
    clone() : ResourceImage
    {
        const img = new ResourceImage(this.img);
        img.size = this.size.clone();
        img.frameDims = this.frameDims.clone();
        img.frames = this.frames.slice();
        img.refreshSize();
        return img;
    }

    swapImage(img:HTMLImageElement)
    {
        this.img = img;
    }

    refreshSize()
    {
        if(!(this.img instanceof HTMLImageElement)) { return; }
        this.size = new Point().setXY(this.img.naturalWidth, this.img.naturalHeight);
        this.frameSize = new Point().setXY(
            this.size.x / this.frameDims.x,
            this.size.y / this.frameDims.y
        )
    }

    async fromCanvas(canv:HTMLCanvasElement)
    {
        const imgNode = new Image();
        imgNode.src = canv.toDataURL();
        await imgNode.decode();
        this.img = imgNode;
        this.refreshSize();
        await this.cacheFrames();
        return this;
    }

    async cacheFrames()
    {
        this.frames = [];

        const promises = [];
        for(let x = 0; x < this.frameDims.x; x++)
        {
            for(let y = 0; y < this.frameDims.y; y++)
            {
                const frame = x + y*this.frameDims.x;
                const data = this.getFrameData(frame);
                const canv = document.createElement("canvas");
                canv.width = data.width;
                canv.height = data.height;

                const ctx = canv.getContext("2d");
                ctx.drawImage(
                    this.img, 
                    data.x, data.y, data.width, data.height, 
                    0, 0, data.width, data.height
                )

                const img = new Image();
                img.src = canv.toDataURL();
                this.frames[frame] = img;
                promises.push(img.decode());
            }
        }

        await Promise.all(promises);
    }

    getImage() : ImageLike { return this.img; }
    async drawTo(canv:HTMLCanvasElement|CanvasRenderingContext2D, operation:CanvasOperation = new CanvasOperation())
    {
        if(canv instanceof CanvasRenderingContext2D) { canv = canv.canvas; }
        operation.addImage(this);
        await operation.apply(canv);
        operation.removeImage(this);
    }

    getFrameData(frm:number) : FrameData
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

    getRatio() : number
    {
        return this.frameSize.x / this.frameSize.y
    }

    getFrame(num:number) : HTMLImageElement
    {
        return this.frames[num];
    }

    
    
}