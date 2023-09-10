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
    img : ImageLike;
    size : Point;
    frameDims : Point;
    frameSize : Point;
    frames : HTMLImageElement[];

    constructor(imageData : ImageLike = document.createElement("img"), params:any = {})
    {
        super()

        if(imageData instanceof HTMLCanvasElement) {
            const imgNode = document.createElement("img");
            imgNode.src = imageData.toDataURL();
            this.img = imgNode;
        } else {
            this.img = (imageData as HTMLImageElement) ?? this.createPlaceholderImage();
        }

        this.frameDims = new Point(params.frames ?? { x: 0, y: 0 });
        this.frameSize = new Point().setXY(
            this.size.x / this.frameDims.x,
            this.size.y / this.frameDims.y
        )

        this.cacheFrames();

        if(this.img instanceof HTMLImageElement) {
            this.size = new Point().setXY(this.img.naturalWidth, this.img.naturalHeight);
        } else {
            console.error("Can't set size of ResourceImage because resource is not an image: ", this.img);
        }

    }
    
    clone() : ResourceImage
    {
        return new ResourceImage(this.img, this);
    }

    cacheFrames()
    {
        this.frames = [];

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
                    canv, 
                    data.x, data.y, data.width, data.height, 
                    0, 0, data.width, data.height
                )

                const img = document.createElement("img");
                img.src = canv.toDataURL();
                this.frames.push(img);
            }
        }
    }

    createPlaceholderImage() : HTMLImageElement
    {
        const canv = document.createElement("canvas");
        canv.width = 512;
        canv.height = 512;
        const ctx = canv.getContext("2d");
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,0,512,512);
        const img = document.createElement("img");
        img.src = canv.toDataURL();
        return img;
    }

    getImage() : ImageLike { return this.img; }
    drawTo(canv:HTMLCanvasElement|CanvasRenderingContext2D, operation:CanvasOperation = new CanvasOperation())
    {
        if(canv instanceof CanvasRenderingContext2D) { canv = canv.canvas; }
        operation.addImage(this);
        operation.apply(canv);
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

    getRatio() : number
    {
        return this.frameSize.x / this.frameSize.y
    }

    getFrame(num:number) : HTMLImageElement
    {
        return this.frames[num];
    }

    
    
}