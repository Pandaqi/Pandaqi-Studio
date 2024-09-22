import Dims from "js/pq_games/tools/geometry/dims";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "../layoutOperation";
import RendererPandaqi from "../renderers/rendererPandaqi";
import TextConfig from "../text/textConfig";
import TextDrawer from "../text/textDrawer";
import Resource from "./resource";
import { CanvasLike } from "./resourceImage";

interface ResourceTextParams
{
    text?: string
    textConfig?: TextConfig
}

export default class ResourceText extends Resource
{
    text:string
    textConfig:TextConfig

    constructor(params:ResourceTextParams|string = {}, cfg:TextConfig = null)
    {
        super()

        if(typeof params == "string")
        {
            this.text = params;
            this.textConfig = cfg ?? new TextConfig();
            return;
        }

        this.text = params.text.toString() ?? "";
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

    getPixiObject(helpers)
    {
        const operation : LayoutOperation = helpers.layoutOperation.clone();
        operation.renderer = new RendererPandaqi(); // only that renderer actuall does rich text => @TODO: find cleaner approach?

        const canv = document.createElement("canvas");
        const size = operation.tempTextDrawer.dims.getSize();
        canv.width = size.x;
        canv.height = size.y;

        const ctx = canv.getContext("2d");
        operation.setFillAndStrokeOnContext(ctx);

        // @TODO: should probably mess around with settings here for proper positioning/no cutoff, or do I already do that?
        // => The `.dims` object from above should already have the right size + be positioned at (0,0), is that enough?
        operation.tempTextDrawer.toCanvas(canv, operation);

        return new helpers.sprite(helpers.texture.from(canv));
    }

    async createPixiObject() {}

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
    
    this.operation.pos = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
    this.operation.size = this.boxOutput.getUsableSize();
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