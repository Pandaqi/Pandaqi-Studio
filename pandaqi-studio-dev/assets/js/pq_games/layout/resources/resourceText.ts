import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "../layoutOperation";
import TextConfig from "../text/textConfig";
import TextDrawer from "../text/textDrawer";
import Resource from "./resource"
import { CanvasLike } from "./resourceImage";
import Dims from "js/pq_games/tools/geometry/dims";

interface ResourceTextParams
{
    text?: string
    textConfig?: TextConfig
}

export default class ResourceText extends Resource
{
    text:string
    textConfig:TextConfig

    constructor(params:ResourceTextParams = {})
    {
        super()

        this.text = params.text ?? "";
        this.textConfig = params.textConfig ?? new TextConfig();
    }
    
    clone(deep = false) : ResourceText
    {
        const tc = deep ? this.textConfig.clone() : this.textConfig
        return new ResourceText({ text: this.text, textConfig: tc });
    }

    /* The `to` functions */
    toCanvas(canv:CanvasLike = null, op:LayoutOperation = null)
    {
        if(canv instanceof CanvasRenderingContext2D) { canv = canv.canvas; }
        op.resource = this;
        op.applyToCanvas(canv);
        return canv;
    }

    // @TODO
    async toPixi(app, parent, op = new LayoutOperation())
    {
        op.resource = this;
        return op.applyToPixi(app, parent);
    }

    async toHTML(op:LayoutOperation = null)
    {
        const textNode = document.createElement("span");
        textNode.innerHTML = this.text;
        textNode.style.display = "inline-block";
        this.textConfig.applyToHTML(textNode);
        return textNode;
    }

    // @TODO
    async toSVG(op:LayoutOperation = null)
    {
        const elem = document.createElementNS(null, "text");
        return elem;
    }

    createTextDrawer(size:Point) : TextDrawer
    {
        const dims = new Dims(0, 0, size.x, size.y);
        return new TextDrawer(this.text, dims, this.textConfig);
    }

    measureDims(size:Point) : Dims
    {
        const drawer = this.createTextDrawer(size);
        return drawer.measureText();
    }

    /* 
    Old placement code for canvas renderer
    @TODO: need to find an alternative for how LayoutNodes give their position and dims to children
    Probably by setting it on that LayoutOperation then passing that into the `toCanvas` called on children 
    
    this.operation.translate = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
    this.operation.dims = this.boxOutput.getUsableSize();
    */

    /*
    Old code for calculating exact dimensions 

    // Our text is "faked" as another node inside of us
    // By fake drawing it to a canvas, we can calculate its actual display size
    // Now the rest of the system automatically takes over
    // (as it's just a child with a fixed size, so the parent can resize accordingly)
    calculateDimensionsContent()
    {
        const drawer = this.createTextDrawer();
        const dims = drawer.measureText();
        this.textNode.boxInput.size = new TwoAxisValue(dims.size.x, dims.size.y);
        this.textNode.boxInput.position = new TwoAxisValue(dims.position.x, dims.position.y);

        return super.calculateDimensionsContent();
    }
    */
}