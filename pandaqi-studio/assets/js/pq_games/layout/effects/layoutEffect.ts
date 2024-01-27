import ResourceImage, { CanvasDrawableLike, CanvasLike } from "js/pq_games/layout/resources/resourceImage";
import LayoutOperation from "../layoutOperation";
import { ElementLike } from "../resources/resource";
import Point from "js/pq_games/tools/geometry/point";
import EffectsOperation from "./effectsOperation";

export default class LayoutEffect
{
    constructor(params:Record<string,any> = {}) { }

    applyToImage(image:CanvasDrawableLike = null, effOp:EffectsOperation) : CanvasDrawableLike { return null; }

    async applyToImageOverwrite(image:ResourceImage)
    {
        const op = new LayoutOperation();
        op.addEffect(this);
        const imgRes = await image.toResourceImage(op);
        image.fromResourceImage(imgRes);
    }

    applyToCanvas(canv:CanvasLike, effOp:EffectsOperation) { }
    applyToCanvasPost(source:CanvasLike) : CanvasRenderingContext2D { return null; }
    applyToHTML(div:ElementLike, effOp:EffectsOperation) { }
    applyToSVG(elem:ElementLike) { }
    clone(deep = false) : LayoutEffect { return new LayoutEffect(); }
    getExtraSizeAdded() : Point { return new Point(); }
}