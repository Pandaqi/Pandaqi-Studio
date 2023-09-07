import Container from "./container"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import CanvasOperation from "js/pq_games/canvas/canvasOperation"
import Point from "js/pq_games/tools/geometry/point"


export default class ContainerImage extends Container
{
    resource : ResourceImage
    operation : CanvasOperation

    // @TODO: the "operation" should probably be on ALL containers and applied to ALL of them, right?
    constructor(params:any = {})
    {
        params.keepRatio = params.resource.getRatio();
        params.widthDynamic = 1.0;
        params.heightDynamic = 1.0;
        super(params);
        
        this.operation = new CanvasOperation(params);
        this.resource = params.resource ?? new ResourceImage();
        if(params.frame) { this.resource.frame = params.frame; }
    }

    drawToCustom(canv:HTMLCanvasElement)
    {
        let pos = new Point();
        this.operation.pos = pos;
        this.operation.size = this.boxOutput.size;
        this.resource.drawTo(canv, this.operation);
    }
}