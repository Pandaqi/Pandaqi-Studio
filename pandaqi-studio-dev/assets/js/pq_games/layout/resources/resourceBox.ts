import Shape from "js/pq_games/tools/geometry/shape";
import Resource from "./resource"
import LayoutOperation from "../layoutOperation";
import { CanvasLike } from "./resourceImage";

export default class ResourceBox extends Resource
{    
    clone(deep = false) : ResourceBox { return new ResourceBox(); }

    async toCanvas(canv:CanvasLike = null, op:LayoutOperation = new LayoutOperation())
    {
        op.resource = this;
        return await op.applyToCanvas(canv);
    }

    async toHTML(op = new LayoutOperation())
    {
        const div = document.createElement("div");
        return div;
    }
    
    async toSVG(op = new LayoutOperation())
    {
        return this.toHTML(); // @TODO?
    }
}