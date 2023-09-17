import LayoutOperation from "../layoutOperation";
import TextConfig from "../text/textConfig";
import Resource from "./resource"
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
    async toCanvas(canv:CanvasLike = null, op:LayoutOperation = null)
    {
        if(canv instanceof CanvasRenderingContext2D) { canv = canv.canvas; }

        // @TODO

        /* Old placement code for canvas renderer
        this.operation.translate = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
        this.operation.dims = this.boxOutput.getUsableSize();
        */


        return canv;
    }

    async toHTML(op:LayoutOperation = null)
    {
        const textNode = document.createElement("span");
        textNode.innerHTML = this.text;
        this.textConfig.applyToHTML(textNode);
        return textNode;
    }

    // @TODO
    async toSVG(op:LayoutOperation = null)
    {
        const elem = document.createElementNS(null, "text");
        return elem;
    }
    
    createTextDrawer() : TextDrawer
    {
        const pos = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
        const size = this.boxOutput.getUsableSize();
        const dims = new Dims(pos.x, pos.y, size.x, size.y);
        return new TextDrawer(this.text, dims, this.textConfig);
    }

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

    drawToCustom(canv:HTMLCanvasElement)
    {
        this.createTextDrawer().drawTo(canv);
    }
    
}