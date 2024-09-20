import LayoutOperation from "../layoutOperation";
import { CanvasLike } from "./resourceImage";

type ElementLike = HTMLElement|SVGElement

export { ElementLike, Resource };
export default class Resource
{
    constructor() { }
    clone(deep = false) : any
    {
        return new Resource();
    }

    toCanvas(canv:CanvasLike = null, op:LayoutOperation = null) : HTMLCanvasElement 
    { 
        return document.createElement("canvas"); 
    }

    async toHTML(op:LayoutOperation = null) : Promise<ElementLike> 
    { 
        return document.createElement("div"); 
    }

    async toSVG(op:LayoutOperation = null) : Promise<ElementLike> 
    { 
        const svgNS = "http://www.w3.org/2000/svg";
        return document.createElementNS(svgNS, "svg"); 
    }

    async createPixiObject() {}
    getPixiObject(param = null) {}
    async toPixi(app, parent, op:LayoutOperation = new LayoutOperation()) {}
    
}