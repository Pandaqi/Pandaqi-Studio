import LayoutOperation from "../layoutOperation";
import { CanvasLike } from "./resourceImage";

export default class Resource
{
    operation: LayoutOperation

    constructor()
    {
        this.operation = new LayoutOperation();
    }

    clone(deep = false) : any
    {
        return new Resource();
    }

    async toCanvas(canv:CanvasLike = null, op:LayoutOperation = null) : Promise<HTMLCanvasElement> { return document.createElement("canvas"); }
    async toHTML(op:LayoutOperation = null) : Promise<HTMLElement> { return document.createElement("div"); }
    async toSVG(op:LayoutOperation = null) : Promise<HTMLElement> { return document.createElement("svg"); }
}