import Container from "./container"
import ResourceFont from "js/pq_games/layout/resources/resourceFont"
import TextConfig from "js/pq_games/layout/text/textConfig"
import TextDrawer from "js/pq_games/layout/text/textDrawer"
import Dims from "js/pq_games/tools/geometry/dims"
import TwoAxisValue from "../values/twoAxisValue"

export default class ContainerText extends Container
{
    resource : ResourceFont
    textConfig : TextConfig
    text : string
    textNode : Container

    constructor(params:any = {})
    {
        super(params);
        this.text = params.text ?? "";
        this.resource = params.resource ?? null;
        this.textConfig = params.textConfig ?? new TextConfig();

        this.textNode = new Container();
        this.addChild(this.textNode);
    }

    createTextDrawer() : TextDrawer
    {
        const pos = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
        const size = this.boxOutput.getUsableSize();
        const dims = new Dims(pos.x, pos.y, size.x, size.y);
        return new TextDrawer(this.text, dims, this.textConfig);
    }

    dependsOnContent()
    {
        return true;
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

    toHTMLCustom(div:HTMLDivElement, wrapper:HTMLDivElement = null)
    {
        const textNode = document.createElement("span");
        textNode.innerHTML = this.text;
        div.appendChild(textNode);

        textNode.style.fontFamily = this.textConfig.getNameString();
        textNode.style.fontWeight = this.textConfig.getWeightString();
        textNode.style.fontVariant = this.textConfig.getVariantString();
        textNode.style.fontStyle = this.textConfig.getStyleString();
        textNode.style.color = this.textConfig.color;
        textNode.style.fontSize = this.textConfig.getSizeString();
        textNode.style.lineHeight = (this.textConfig.lineHeight * 100) + "%";
        textNode.style.textAlign = this.textConfig.getAlignString();

        return div;
    }
}