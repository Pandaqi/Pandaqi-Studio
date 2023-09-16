import Shape from "js/pq_games/tools/geometry/shape";
import Container from "./container"
import Circle from "js/pq_games/tools/geometry/circle";

export default class ContainerShape extends Container
{
    shape: Shape

    constructor(params:any = {})
    {
        super(params);
        this.shape = params.shape ?? new Circle();
    }

    drawToCustom(canv:HTMLCanvasElement)
    {
        this.operation.translate = this.getGlobalPosition().add(this.boxOutput.getTopAnchor());
        this.operation.dims = this.boxOutput.getUsableSize();
        this.shape.drawTo(canv, this.operation);
    }

    toHTMLCustom(div:HTMLElement, wrapper:HTMLDivElement = null)
    {
        super.toHTMLCustom(div, wrapper);

        const elem = this.shape.toSVG();
        elem.setAttribute("fill", this.propsInput.fill.get());
        elem.setAttribute("stroke", this.boxInput.stroke.color.get());
        elem.setAttribute("stroke-width", this.boxInput.stroke.width.top.get().toString())

        div.appendChild(elem);
    }
}