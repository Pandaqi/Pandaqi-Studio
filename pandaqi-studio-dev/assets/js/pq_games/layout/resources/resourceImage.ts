import CanvasOperation from "js/pq_games/canvas/canvasOperation"
import Resource from "./resource"
import Point from "js/pq_games/tools/geometry/point"

interface FrameData {
    x: number,
    y: number,
    width: number,
    height: number
}

export default class ResourceImage extends Resource
{
    img : HTMLImageElement;
    size : Point;
    frames : Point;
    frameSize : Point;

    constructor(img : HTMLImageElement = document.createElement("img"), params:any = {})
    {
        super()

        this.img = img;
        this.size = new Point().setXY(img.naturalWidth, img.naturalHeight);
        this.frames = params.frames ?? new Point().setXY(1,1);
        this.frameSize = new Point().setXY(
            this.size.x / this.frames.x,
            this.size.y / this.frames.y
        )
    }
    
    clone() : ResourceImage
    {
        return new ResourceImage(this.img, this);
    }

    getImage() : HTMLImageElement { return this.img; }
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
            frm % this.frames.x,
            Math.floor(frm / this.frames.x)
        )

        return {
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

    
    
}