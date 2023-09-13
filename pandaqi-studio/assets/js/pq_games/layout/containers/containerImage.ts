import Container from "./container"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"

enum ImageDisplayMethod
{
    IMAGE,
    BACKGROUND
}

export { ContainerImage, ImageDisplayMethod }
export default class ContainerImage extends Container
{
    resource : ResourceImage
    frame : number
    displayMethod : ImageDisplayMethod

    constructor(params:any = {})
    {
        params.keepRatio = params.resource.getRatio();
        super(params);
        
        this.resource = params.resource ?? new ResourceImage();
        this.frame = params.frame ?? 0;
        this.displayMethod = params.displayMethod ?? ImageDisplayMethod.IMAGE;
    }

    drawToCustom(canv:HTMLCanvasElement)
    {
        this.operation.translate = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
        this.operation.dims = this.boxOutput.getUsableSize();
        this.operation.frame = this.frame;
        this.resource.drawTo(canv, this.operation);
    }

    toHTMLCustom(div:HTMLDivElement, wrapper:HTMLDivElement = null)
    {
        super.toHTMLCustom(div, wrapper);

        const asBackground = (this.displayMethod == ImageDisplayMethod.BACKGROUND);
        const subNode = asBackground ? this.createImageAsBackground() : this.createImageAsElement();
        div.appendChild(subNode);
    }

    createImageAsBackground() : HTMLDivElement
    {
        const node = document.createElement("div");
        
        node.style.width = "100%";
        node.style.height = "100%";
        node.style.backgroundImage = "url(" + this.resource.img.src + ")";
        node.style.backgroundSize = (this.resource.frameDims.x * 100) + "%";
        
        const frameData = this.resource.getFrameData(this.frame);
        node.style.backgroundPositionX = (-frameData.xIndex * this.boxInput.size.x.get()) + "px";
        node.style.backgroundPositionY = (-frameData.yIndex * this.boxInput.size.y.get()) + "px";

        return node;
    }

    createImageAsElement() : HTMLImageElement
    {
        console.log(this.resource);

        const img = this.resource.getFrame(this.frame).cloneNode() as HTMLImageElement;
        img.style.width = "100%";
        img.style.height = "100%";
        return img;
    }
}