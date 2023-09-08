import Container from "./container"
import ResourceFont from "js/pq_games/layout/resources/resourceFont"
import TextConfig from "js/pq_games/layout/text/textConfig"
import TextDrawer from "js/pq_games/layout/text/textDrawer"
import Dims from "js/pq_games/tools/geometry/dims"

export default class ContainerText extends Container
{
    resource : ResourceFont
    textConfig : TextConfig
    text : string

    constructor(params:any = {})
    {
        super(params);
        this.text = params.text ?? "";
        this.resource = params.resource ?? null;
        this.textConfig = params.textConfig ?? new TextConfig();
    }

    drawToCustom(canv:HTMLCanvasElement)
    {
        const pos = this.boxOutput.getTopAnchor();
        const size = this.boxOutput.getUsableSize();
        const dims = new Dims(pos.x, pos.y, size.x, size.y);
        const drawer = new TextDrawer(this.text, dims, this.textConfig);
        drawer.drawTo(canv);
    }
}