import Point from "js/pq_games/tools/geometry/point";
import AnchorValue from "../values/anchorValue";
import Container from "../containers/container";

export default class AnchorTool
{
    anchor:AnchorValue

    constructor(a:AnchorValue)
    {
        this.anchor = a;
    }

    applyTo(div:HTMLDivElement, wrapper:HTMLDivElement = null, parent:Container = null)
    {
        if(this.anchor == AnchorValue.NONE) { return; }
        if(!wrapper) { return; }

        wrapper.style.display = "flex";
        wrapper.style.position = "absolute";
        wrapper.style.left = "0";
        wrapper.style.top = "0";
        wrapper.style.padding = parent.boxInput.padding.toCSS(); // @TODO: take over padding from parent;

        /* @TODO: this does properly center stuff 

        position: absolute;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;
        */

        
        let flowAxis = "start";
        let stackAxis = "start";
        let centerX = false;
        let centerY = false;
        if(this.anchor == AnchorValue.TOP_CENTER) {
            flowAxis = "center";
            centerX = true;
        } else if(this.anchor == AnchorValue.TOP_RIGHT) {
            flowAxis = "end";
        } else if(this.anchor == AnchorValue.CENTER_LEFT) {
            stackAxis = "center";
            centerY = true;
        } else if(this.anchor == AnchorValue.CENTER_CENTER) {
            flowAxis = "center";
            stackAxis = "center";
            centerX = true;
            centerY = true;
        } else if(this.anchor == AnchorValue.CENTER_RIGHT) {
            flowAxis = "end";
            stackAxis = "center";
            centerY = true;
        } else if(this.anchor == AnchorValue.BOTTOM_LEFT) {
            stackAxis = "end";
        } else if(this.anchor == AnchorValue.BOTTOM_CENTER) {
            flowAxis = "center";
            stackAxis = "end";
            centerY = true;
        } else if(this.anchor == AnchorValue.BOTTOM_RIGHT) {
            flowAxis = "end";
            stackAxis = "end";
        }

        wrapper.style.justifyContent = flowAxis;
        wrapper.style.alignContent = stackAxis;
        wrapper.style.alignItems = stackAxis;

        // @TODO: only do this if background? Or if set manually by me? If size too large for container?
        if(centerX) { wrapper.style.left = "50%"; }
        if(centerY) { wrapper.style.top = "50%"; }

        const translate = new Point();
        if(centerX) { translate.x = -50 }
        if(centerY) { translate.y = -50 }
        wrapper.style.transform = "translate(" + translate.x + "%, " + translate.y + "%)";
    }
}