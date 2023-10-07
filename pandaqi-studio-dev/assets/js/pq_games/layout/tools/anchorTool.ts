import Point from "js/pq_games/tools/geometry/point";
import AnchorValue from "../values/anchorValue";
import Container from "../layoutNode";
import BoxOutput from "../values/aggregators/boxOutput";
import { ElementLike } from "../resources/resource";

export default class AnchorTool
{
    anchor:AnchorValue

    constructor(a:AnchorValue)
    {
        this.anchor = a;
    }

    applyToBoxOutput(b:BoxOutput) : Point
    {
        const p = b.offsetTop.clone();
        const a = this.anchor;
        
        if(!b.usableParentSize.isValid()) { return p; }
        if(a == AnchorValue.TOP_LEFT || a == AnchorValue.NONE) { return p; }

        const bottomRight = b.usableParentSize.clone().move(b.offsetTop).sub(b.size);
        const center = b.usableParentSize.clone().scaleFactor(0.5).sub(b.size.clone().scaleFactor(0.5)).add(b.offsetTop);

        if(a == AnchorValue.TOP_CENTER) {
            p.x = center.x;
        } else if(a == AnchorValue.TOP_RIGHT) {
            p.x = bottomRight.x;
        } else if(a == AnchorValue.CENTER_LEFT) {
            p.y = center.y;
        } else if(a == AnchorValue.CENTER_CENTER) {
            p.x = center.x;
            p.y = center.y;
        } else if(a == AnchorValue.CENTER_RIGHT) {
            p.x = bottomRight.x;
            p.y = center.y;
        } else if(a == AnchorValue.BOTTOM_LEFT) {
            p.y = bottomRight.y;
        } else if(a == AnchorValue.BOTTOM_CENTER) {
            p.x = center.x;
            p.y = bottomRight.y;
        } else if(a == AnchorValue.BOTTOM_RIGHT) {
            p.x = bottomRight.x;
            p.y = bottomRight.y;
        }

        return p;
    }

    applyTo(div:ElementLike, wrapper:HTMLDivElement = null, parent:Container = null)
    {
        if(this.anchor == AnchorValue.NONE) { return; }
        if(!wrapper) { return; }

        wrapper.style.display = "flex";
        wrapper.style.position = "absolute";
        wrapper.style.left = "0";
        wrapper.style.top = "0";
        wrapper.style.padding = parent.boxInput.padding.toCSS(); 

        let flowAxis = "start";
        let stackAxis = "start";
        let centerX = false;
        let centerY = false;
        let endX = false;
        let endY = false;
        if(this.anchor == AnchorValue.TOP_CENTER) {
            flowAxis = "center";
            centerX = true;
        } else if(this.anchor == AnchorValue.TOP_RIGHT) {
            flowAxis = "end";
            endX = true;
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
            endX = true;
        } else if(this.anchor == AnchorValue.BOTTOM_LEFT) {
            stackAxis = "end";
            endY = true;
        } else if(this.anchor == AnchorValue.BOTTOM_CENTER) {
            flowAxis = "center";
            stackAxis = "end";
            centerY = true;
            endY = true;
        } else if(this.anchor == AnchorValue.BOTTOM_RIGHT) {
            flowAxis = "end";
            stackAxis = "end";
            endX = true;
            endY = true;
        }

        wrapper.style.justifyContent = flowAxis;
        wrapper.style.alignContent = stackAxis;
        wrapper.style.alignItems = stackAxis;

        // @TODO: only do this if ghost? Or if set manually by me? If size too large for container?
        // @TODO: can be much cleaner and more efficient
        if(centerX) { wrapper.style.left = "50%"; }
        if(centerY) { wrapper.style.top = "50%"; }
        if(endX) { wrapper.style.left = "100%"; }
        if(endY) { wrapper.style.top = "100%"; }

        const translate = new Point();
        if(centerX) { translate.x = -50 }
        if(centerY) { translate.y = -50 }
        if(endX) { translate.x = -100 }
        if(endY) { translate.y = -100 }
        wrapper.style.transform = "translate(" + translate.x + "%, " + translate.y + "%)";
    }
}