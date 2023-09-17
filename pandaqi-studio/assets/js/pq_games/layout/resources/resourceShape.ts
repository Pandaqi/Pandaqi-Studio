import Resource from "./resource"
import LayoutOperation from "../layoutOperation";
import Shape from "js/pq_games/tools/geometry/shape";
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

    async toCanvas(canv:CanvasLike = null, op:LayoutOperation = null)
    {
        const dims = this.shape.getDimensions();
        if(!canv) { canv = createCanvas({ width: dims.size.x, height: dims.size.y }); }

        const operation = op ?? this.operation;
        operation.resource = this;
        return await operation.applyToCanvas(canv);
    }

    async toHTML(op:LayoutOperation = null)
    {
        const operation = op ?? this.operation;

        const svg = document.createElement("svg");
        const dims = this.shape.getDimensions();
        svg.setAttribute("width", dims.size.x.toString());
        svg.setAttribute("height", dims.size.y.toString());
        const elem = await this.toSVG();
        svg.appendChild(elem);

        operation.applyToHTML(svg);
        return svg;
    }
    
    async toSVG(op:LayoutOperation = null)
    {
        return this.shape.toSVG();
    }
}