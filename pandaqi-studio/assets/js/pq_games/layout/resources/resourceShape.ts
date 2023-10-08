import Shape from "js/pq_games/tools/geometry/shape";
import Resource from "./resource"
import LayoutOperation from "../layoutOperation";
import { CanvasLike } from "./resourceImage";
import createCanvas from "js/pq_games/layout/canvas/createCanvas";

interface ResourceShapeParams
{
    shape?:Shape
}

export default class ResourceShape extends Resource
{
    shape: Shape

    constructor(params:ResourceShapeParams = {})
    {
        super()
        this.shape = params.shape ?? new Shape();
    }
    
    clone(deep = false) : ResourceShape
    {
        let shape = deep ? this.shape.clone() : this.shape;
        return new ResourceShape({ shape: shape });
    }

    async toCanvas(canv:CanvasLike = null, op:LayoutOperation = new LayoutOperation())
    {
        const dims = this.shape.getDimensions();
        if(!canv) { canv = createCanvas({ width: dims.size.x, height: dims.size.y }); }
        op.resource = this;
        return await op.applyToCanvas(canv);
    }

    async toHTML(op = new LayoutOperation())
    {
        // @DEBUGGING
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        //const dims = this.shape.getDimensions();
        const sizeInt = op.dims.clone().round();
        //svg.setAttribute("width", sizeInt.x.toString());
        //svg.setAttribute("height", sizeInt.y.toString());
        svg.setAttribute("viewBox", "0 0 " + sizeInt.x + " " + sizeInt.y);
        svg.setAttribute("fill", "none");
        svg.setAttribute("xmlns", svgNS)
        
        const elem = await this.toSVG(op);
        svg.appendChild(elem);
        return svg;
    }
    
    async toSVG(op = new LayoutOperation())
    {
        return await op.applyToSVG(this.shape.toSVG());
    }
}