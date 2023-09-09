import Container from "./container"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import CanvasOperation from "js/pq_games/canvas/canvasOperation"
import Point from "js/pq_games/tools/geometry/point"


export default class ContainerImage extends Container
{
    resource : ResourceImage
    operation : CanvasOperation
    frame : number

    // @TODO: the "operation" should probably be on ALL containers and applied to ALL of them, right?
    constructor(params:any = {})
    {
        params.keepRatio = params.resource.getRatio();
        super(params);
        
        this.operation = new CanvasOperation(params);
        this.resource = params.resource ?? new ResourceImage();
        this.frame = params.frame ?? 0;
    }

    drawToCustom(canv:HTMLCanvasElement)
    {
        this.operation.pos = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
        this.operation.size = this.boxOutput.getUsableSize();
        this.operation.frame = this.frame;
        this.resource.drawTo(canv, this.operation);
    }
}