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
    pixiObject: any

    constructor(params:ResourceShapeParams|Shape = {})
    {
        super()
        this.shape = (params instanceof Shape) ? params : (params.shape ?? new Shape());
    }
    
    clone(deep = false) : ResourceShape
    {
        let shape = deep ? this.shape.clone() : this.shape;
        return new ResourceShape({ shape: shape });
    }

    toCanvas(canv:CanvasLike = null, op:LayoutOperation = new LayoutOperation())
    {
        const dims = this.shape.getDimensions();
        if(!canv) { canv = createCanvas({ width: dims.size.x, height: dims.size.y }); }
        op.resource = this;
        return op.applyToCanvas(canv);
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

    async toPixi(app, parent, op = new LayoutOperation())
    {
        op.resource = this;
        return op.applyToPixi(app, parent);
    }

    getPixiObject(graphicsConstructor) 
    { 
        if(!this.pixiObject) { this.pixiObject = this.shape.createPixiObject(graphicsConstructor); }
        return this.pixiObject;
    }
}