import Container from "./container"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import CanvasOperation from "js/pq_games/canvas/canvasOperation"
import Point from "js/pq_games/tools/geometry/point"

enum ImageDisplayMethod
{
    IMAGE,
    BACKGROUND
}

export { ContainerImage, ImageDisplayMethod }
export default class ContainerImage extends Container
{
    resource : ResourceImage
    operation : CanvasOperation
    frame : number
    displayMethod : ImageDisplayMethod

    // @TODO: the "operation" should probably be on ALL containers and applied to ALL of them, right?
    // YES, and then we apply it through CSS transforms in the tree
    constructor(params:any = {})
    {
        params.keepRatio = params.resource.getRatio();
        super(params);
        
        this.operation = new CanvasOperation(params);
        this.resource = params.resource ?? new ResourceImage();
        this.frame = params.frame ?? 0;
        this.displayMethod = params.displayMethod ?? ImageDisplayMethod.IMAGE;
    }

    drawToCustom(canv:HTMLCanvasElement)
    {
        this.operation.pos = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
        this.operation.size = this.boxOutput.getUsableSize();
        this.operation.frame = this.frame;
        this.resource.drawTo(canv, this.operation);
    }

    toHTMLCustom(div:HTMLDivElement, wrapper:HTMLDivElement = null)
    {
        super.toHTMLCustom(div,wrapper);

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
        const img = this.resource.getFrame(this.frame).cloneNode() as HTMLImageElement;
        img.style.width = "100%";
        img.style.height = "100%";
        return img;
    }
}