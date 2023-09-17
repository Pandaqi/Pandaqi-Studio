import ResourceImage, { CanvasLike } from "js/pq_games/layout/resources/resourceImage";

export default class LayoutEffect
{
    constructor(params:Record<string,any> = {}) { }

    async applyToImage(image:ResourceImage = null) { }
    
    applyToCanvas(canv:CanvasLike) { }
    applyToHTML(div:HTMLElement) { }
    applyToSVG(elem:HTMLElement) { }
    clone(deep = false) : LayoutEffect { return new LayoutEffect(); }
}