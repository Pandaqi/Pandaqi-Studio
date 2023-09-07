import Point from "js/pq_games/tools/geometry/point"
import { FourSideOutput } from "./fourSideValue"
import { StrokeOutput } from "./strokeValue"
import AnchorValue from "./anchorValue"
import { FourSideValue } from "./fourSideValue"

import BoxInput from "./boxInput"

export default class BoxOutput
{
    // margin parent + padding/border ourselves (automatically calculated)
    offsetTop: Point = new Point()
    offsetBottom: Point = new Point()

    // the USABLE space inside the parent, ignoring whitespace (automatically calculated)
    parentWidth: number = 0
    parentHeight: number = 0

    // properties
    margin: FourSideOutput
    padding: FourSideOutput
    stroke: StrokeOutput

    position : Point
    size : Point
    positionMin : Point
    positionMax : Point
    sizeMin : Point
    sizeMax : Point

    offset : Point
    anchor : AnchorValue
    keepRatio : number

    makeRoot()
    {
        this.position = new Point();
        this.offset = new Point();
        this.margin = new FourSideValue().get();
        this.padding = new FourSideValue().get();
    }

    setRect(x:number, y: number, w:number, h:number)
    {
        this.position = new Point().setXY(x,y);
        this.size = new Point().setXY(w,h);
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
        
        this.offsetTop = new Point().setXY(
            parentBox.padding.left + this.margin.left + sMult * this.stroke.width.left, 
            parentBox.padding.top + this.margin.top + sMult * this.stroke.width.top
        );
        this.offsetBottom = new Point().setXY(
            parentBox.padding.right + this.margin.right + sMult * this.stroke.width.right,
            parentBox.padding.bottom + this.margin.bottom + sMult * this.stroke.width.bottom
        )

        this.parentWidth = parentBox.size.x - this.offsetTop.x - this.offsetBottom.x;
        this.parentHeight = parentBox.size.y - this.offsetTop.y - this.offsetBottom.y;
    }

    postCalculate()
    {
        if(this.keepRatio > 0)
        {
            if(this.keepRatio >= 1.0) { this.size.y = this.size.x * this.keepRatio; }
            else { this.size.x = this.size.y / this.keepRatio; } 
        }

        this.clampSize();

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
        if(!this.parentWidth || !this.parentHeight) { return p; }
        if(a == AnchorValue.TOP_LEFT || a == AnchorValue.NONE) { return p; }

        console.log(this.offsetTop);

        const rightEdge = this.parentWidth + this.offsetTop.x - this.size.x;
        const bottomEdge = this.parentHeight + this.offsetTop.y - this.size.y;
        const center = new Point().setXY(
            0.5*this.parentWidth - 0.5*this.size.x,
            0.5*this.parentHeight - 0.5*this.size.y
        );

        if(a == AnchorValue.TOP_CENTER) {
            p.x = center.x;
        } else if(a == AnchorValue.TOP_RIGHT) {
            p.x = rightEdge;
        } else if(a == AnchorValue.CENTER_LEFT) {
            p.y = center.y;
        } else if(a == AnchorValue.CENTER_CENTER) {
            p.x = center.x;
            p.y = center.y;
        } else if(a == AnchorValue.CENTER_RIGHT) {
            p.x = rightEdge;
            p.y = center.y;
        } else if(a == AnchorValue.BOTTOM_LEFT) {
            p.y = bottomEdge;
        } else if(a == AnchorValue.BOTTOM_CENTER) {
            p.x = center.x;
            p.y = bottomEdge;
        } else if(a == AnchorValue.BOTTOM_RIGHT) {
            p.x = rightEdge;
            p.y = bottomEdge;
        }

        return p;
    }
}