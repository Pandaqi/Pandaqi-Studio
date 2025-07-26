import Point from "js/pq_games/tools/geometry/point"
import { FourSideOutput } from "../fourSideValue"
import { StrokeOutput } from "../strokeValue"
import AnchorValue from "../anchorValue"
import { FourSideValue } from "../fourSideValue"
import PlacementValue from "../placementValue"

import BoxInput from "./boxInput"
import Container from "../../layoutNode"
import OutputGroup from "./outputGroup"
import AnchorTool from "../../tools/anchorTool"

export default class BoxOutput extends OutputGroup
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

    ghost: boolean
    placement: PlacementValue

    clone()
    {
        const b = new BoxOutput();
        return super.cloneInto(b);
    }

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
            pos = new AnchorTool(this.anchor).applyToBoxOutput(this);
        }
        pos.add(this.offset);
        this.position = pos;

        this.clampPosition();
    }

    getTopAnchor()
    {
        if(this.ghost) { return new Point(); }
        return this.anchorTop.clone();
    }

    getUsableSize()
    {
        if(this.ghost) { return this.getSize(); }
        return this.getSizeContent();
    }
}