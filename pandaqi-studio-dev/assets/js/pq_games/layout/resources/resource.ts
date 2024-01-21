import LayoutOperation from "../layoutOperation";
import TransformationMatrix from "../tools/transformationMatrix";
import { CanvasLike } from "./resourceImage";

type ElementLike = HTMLElement|SVGElement

export { Resource, ElementLike }
export default class Resource
{
    constructor() { }
    clone(deep = false) : any
    {
        return new Resource();
    }

    async toCanvas(canv:CanvasLike = null, op:LayoutOperation = null) : Promise<HTMLCanvasElement> 
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
}