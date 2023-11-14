import ResourceImage, { CanvasLike } from "js/pq_games/layout/resources/resourceImage";
import LayoutOperation, { EffectData } from "../layoutOperation";
import { ElementLike } from "../resources/resource";

export default class LayoutEffect
{
    constructor(params:Record<string,any> = {}) { }

    async applyToImage(image:ResourceImage = null, effectData:EffectData = {}) : Promise<ResourceImage> 
    { 
        return image; 
    }

    async applyToImageOverwrite(image:ResourceImage)
    {
        const op = new LayoutOperation();
        op.addEffect(this);
        const imgRes = await image.toResourceImage(op);
        image.fromResourceImage(imgRes);
    }

    applyToCanvas(canv:CanvasLike, effectData:EffectData = {}) { }
    async applyToCanvasPost(source:CanvasLike) : Promise<CanvasRenderingContext2D> { return null; }
    applyToHTML(div:ElementLike, effectData:EffectData = {}) { }
    applyToSVG(elem:ElementLike) { }
    clone(deep = false) : LayoutEffect { return new LayoutEffect(); }
}