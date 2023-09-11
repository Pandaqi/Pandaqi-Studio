import ResourceImage from "js/pq_games/layout/resources/resourceImage";

export default class CanvasEffect
{
    constructor(params:Record<string,any>) { }

    async applyToContext(ctx: CanvasRenderingContext2D, image: ResourceImage = null) { }
    applyToHTML(div:HTMLElement) { }
}