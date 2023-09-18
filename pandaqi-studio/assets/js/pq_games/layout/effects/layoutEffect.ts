import ResourceImage, { CanvasLike } from "js/pq_games/layout/resources/resourceImage";
import { EffectData } from "../layoutOperation";

export default class LayoutEffect
{
    constructor(params:Record<string,any> = {}) { }

    async applyToImage(image:ResourceImage = null, effectData:EffectData = {}) : Promise<ResourceImage> { return image; }
    applyToCanvas(canv:CanvasLike, effectData:EffectData = {}) { }
    applyToHTML(div:HTMLElement, effectData:EffectData = {}) { }
    applyToSVG(elem:HTMLElement) { }
    clone(deep = false) : LayoutEffect { return new LayoutEffect(); }
}