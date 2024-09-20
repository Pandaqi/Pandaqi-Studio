import Point from "js/pq_games/tools/geometry/point";
import ResourceGroup from "../resources/resourceGroup";
import ResourceImage, { CanvasLike } from "../resources/resourceImage";
import { ResourceLoadParams } from "../resources/resourceLoader";
import LayoutOperation from "../layoutOperation";
import Resource, { ElementLike } from "../resources/resource";

interface RendererDrawFinishParams
{
    size?: Point,
    group?: ResourceGroup,
    canvas?: HTMLCanvasElement
}

export { RendererDrawFinishParams }
export default class Renderer
{
    customBatchSize: number = null;

    async cacheLoadedImage(img:HTMLImageElement, params:ResourceLoadParams) : Promise<ResourceImage>
    {
        return new ResourceImage(img, params);
    }

    prepareDraw(cfg:Record<string,any> = {}) : any {}
    async startDraw(cfg:Record<string,any> = {}) {}
    async finishDraw(params:RendererDrawFinishParams) : Promise<HTMLCanvasElement>
    {
        return document.createElement("canvas");
    }

    applyOperationToCanvas(op:LayoutOperation, canv:CanvasLike) : HTMLCanvasElement
    {
        return document.createElement("canvas");
    }

    async applyOperationToHTML(op:LayoutOperation, node:ElementLike, res:Resource = null) : Promise<ElementLike>
    {
        return document.createElement("div");
    }

    async applyOperationToPixi(op:LayoutOperation, app:any, parent:any) : Promise<any> {}
}