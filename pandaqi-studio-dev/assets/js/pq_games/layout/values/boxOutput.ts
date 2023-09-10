import Point from "js/pq_games/tools/geometry/point"
import { FourSideOutput } from "./fourSideValue"
import { StrokeOutput } from "./strokeValue"
import AnchorValue from "./anchorValue"
import { FourSideValue } from "./fourSideValue"

import BoxInput from "./boxInput"
import Container from "../containers/container"
import PlacementValue from "./placementValue"

export default class BoxOutput
{
    // padding parent + margin/border ourselves (automatically calculated)
    offsetTop: Point = new Point()
    offsetBottom: Point = new Point()

    // starting location ( = padding taken into account)
    anchorTop: Point = new Point()
    anchorBottom : Point = new Point()

    // the USABLE space inside the parent, ignoring whitespace (automatically calculated)
    usableParentSize = new Point()

    // properties
    margin: FourSideOutput
    padding: FourSideOutput
    stroke: StrokeOutput

    position : Point
    size : Point
    sizeContent : Point
    positionMin : Point
    positionMax : Point
    sizeMin : Point
    sizeMax : Point

    offset : Point
    anchor : AnchorValue
    keepRatio : number

    background: boolean
    placement: PlacementValue

    makeRoot()
    {
        this.position = new Point();
        this.offset = new Point();
        this.margin = new FourSideValue().get();
        this.padding = new FourSideValue().get();
        return this;
    }

    setRect(x:number, y: number, w:number, h:number)
    {
        this.position = new Point().setXY(x,y);
        this.size = new Point().setXY(w,h);
        return this;
    }

    getPosition()
    {
        return this.position.clone();
    }

    getSizeContent()
    {
        return this.sizeContent.clone();
    }

    getSize()
    {
        return this.size.clone();
    }

    clamp(val:number, low:number, high:number) : number
    {
        return Math.min(Math.max(val, low), high);
    }

    clampSize()
    {
        this.size.x = this.clamp(this.size.x, this.sizeMin.x, this.sizeMax.x);
        this.size.y = this.clamp(this.size.y, this.sizeMin.y, this.sizeMax.y);
    }

    clampPosition()
    {
        this.position.x = this.clamp(this.position.x, this.positionMin.x, this.positionMax.x);
        this.position.y = this.clamp(this.position.y, this.positionMin.y, this.positionMax.y);
    }

    preCalculate(bi:BoxInput, parentBox:BoxOutput)
    {
        if(!parentBox) { return; }

        const sMult = bi.stroke.getDimensionMultiplier();

        this.stroke = bi.stroke.calc(parentBox.size);
        this.margin = bi.margin.calc(parentBox.size);
        this.padding = bi.padding.calc(parentBox.size);

        this.anchorTop = new Point(this.padding.left, this.padding.top);
        this.anchorBottom = new Point(this.padding.right, this.padding.bottom);
        
        this.offsetTop = new Point().setXY(
            parentBox.padding.left + this.margin.left + sMult * this.stroke.width.left, 
            parentBox.padding.top + this.margin.top + sMult * this.stroke.width.top
        );
        this.offsetBottom = new Point().setXY(
            parentBox.padding.right + this.margin.right + sMult * this.stroke.width.right,
            parentBox.padding.bottom + this.margin.bottom + sMult * this.stroke.width.bottom
        )

        this.usableParentSize = new Point(
            parentBox.size.x - this.offsetTop.x - this.offsetBottom.x,
            parentBox.size.y - this.offsetTop.y - this.offsetBottom.y
        );
    }

    postCalculate(b:BoxInput, c:Container)
    {
        if(c.isFlowItem())
        {
            c.flowOutput.applyToBox(this);
        }

        if(this.keepRatio > 0 && b.size.isVariable())
        {
            if(this.keepRatio >= 1.0) { this.size.y = this.size.x * this.keepRatio; }
            else { this.size.x = this.size.y / this.keepRatio; } 
        }

        this.clampSize();

        this.sizeContent = this.size.clone().sub(this.anchorTop).sub(this.anchorBottom);

        let pos = this.position.clone();
        pos.add(this.offsetTop);
        if(this.anchor != AnchorValue.NONE)
        {
            pos = this.convertOffsetToAnchor();
        }
        pos.add(this.offset);
        this.position = pos;

        this.clampPosition();
    }

    // @TODO: move to anchorValue or somewhere else?
    convertOffsetToAnchor() : Point
    {
        const p = this.offsetTop.clone();
        const a = this.anchor;
        if(!this.usableParentSize.isValid()) { return p; }
        if(a == AnchorValue.TOP_LEFT || a == AnchorValue.NONE) { return p; }

        const bottomRight = this.usableParentSize.clone().move(this.offsetTop).sub(this.size);
        const center = this.usableParentSize.clone().scaleFactor(0.5).sub(this.size.clone().scaleFactor(0.5)).add(this.offsetTop);

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

    
    getTopAnchor()
    {
        if(this.background) { return new Point(); }
        return this.anchorTop.clone();
    }

    getUsableSize()
    {
        if(this.background) { return this.getSize(); }
        return this.getSizeContent();
    }
}