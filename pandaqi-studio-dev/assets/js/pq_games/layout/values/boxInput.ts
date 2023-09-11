import TwoAxisValue from "./twoAxisValue"
import FourSideValue from "./fourSideValue"
import StrokeValue from "./strokeValue"
import Value from "./value"
import AnchorValue from "./anchorValue"
import NumberValue from "./numberValue"

import BoxOutput from "./boxOutput"
import Point from "js/pq_games/tools/geometry/point"
import Container from "../containers/container"
import AnchorTool from "../tools/anchorTool"
import PlacementValue from "./placementValue"
import DisplayValue from "./displayValue"
import InputGroup from "./inputGroup"

export default class BoxInput extends InputGroup
{
    margin: FourSideValue
    padding: FourSideValue
    stroke: StrokeValue

    position : TwoAxisValue
    size : TwoAxisValue
    positionMin : TwoAxisValue
    positionMax : TwoAxisValue
    sizeMin : TwoAxisValue
    sizeMax : TwoAxisValue

    offset : TwoAxisValue
    anchor : AnchorValue
    keepRatio : NumberValue

    ghost: boolean

    placement: PlacementValue
    display: DisplayValue

    constructor(params:Record<string,any> = {})
    {
        super(params)

        // basic positioning properties
        this.margin = new FourSideValue(params.margin);
        this.padding = new FourSideValue(params.padding);
        this.stroke = new StrokeValue(params.stroke);

        this.offset = new TwoAxisValue(params.offset ?? new Point());
        this.anchor = params.anchor ?? AnchorValue.NONE;
        this.keepRatio = new NumberValue(params.keepRatio ?? 0.0);

        this.ghost = params.ghost ?? false;

        // all the big size/dimension/location properties
        const pos = this.readTwoAxisParams(params, ["x", "y", "pos"]);
        this.position = params.position ?? new TwoAxisValue(pos);

        const posMin = this.readTwoAxisParams(params, ["xMin", "yMin", "posMin"], [-Infinity, -Infinity]);
        this.positionMin = new TwoAxisValue(posMin);

        const posMax = this.readTwoAxisParams(params, ["xMax", "yMax", "posMax"], [Infinity, Infinity]);
        this.positionMax = new TwoAxisValue(posMax);

        const size = this.readTwoAxisParams(params, ["width", "height", "size"]);
        this.size = new TwoAxisValue(size);

        const sizeMin = this.readTwoAxisParams(params, ["widthMin", "heightMin", "sizeMin"], [0, 0]);
        this.sizeMin = new TwoAxisValue(sizeMin);

        const sizeMax = this.readTwoAxisParams(params, ["widthMax", "heightMax", "sizeMax"], [Infinity, Infinity]);
        this.sizeMax = new TwoAxisValue(sizeMax);
    }

    hasAbsoluteChildren(div:HTMLDivElement)
    {
        const list = Object.values(div.childNodes) as HTMLElement[];
        for(const child of list)
        {
            if(child.style.position == "absolute") { return true; }
        }
        return false;
    }

    applyToHTML(div:HTMLDivElement, wrapper:HTMLDivElement = null, parent:Container = null)
    {
        let topElem = wrapper ? wrapper : div;

        div.style.margin = this.margin.toCSS();
        div.style.padding = this.padding.toCSS();

        div.style.borderWidth = this.stroke.width.toCSS();
        div.style.borderStyle = this.stroke.getStyleAsCSSProp();
        div.style.borderColor = this.stroke.color.toCSS();

        div.style.width = this.size.x.toCSS();
        div.style.height = this.size.y.toCSS();
        div.style.minWidth = this.sizeMin.x.toCSS();
        div.style.maxWidth = this.sizeMax.x.toCSS();
        div.style.minHeight = this.sizeMin.y.toCSS();
        div.style.maxHeight = this.sizeMax.y.toCSS();

        if(this.hasCustomPosition())
        {
            div.style.left = this.position.x.toCSS();
            div.style.top = this.position.y.toCSS();            
        }

        const anchorTool = new AnchorTool(this.anchor);
        anchorTool.applyTo(div, wrapper, parent);

        let position = "relative";
        if(this.needsAbsolutePosition()) { position = "absolute"; }
        if(this.placement == PlacementValue.ABSOLUTE) { position = "absolute"; }
        else if(this.placement == PlacementValue.STICKY) { position = "fixed"; }
        topElem.style.position = position;

        
        let display = "block";
        if(this.display == DisplayValue.INLINE) { display = "inline"; }
        else if(this.display == DisplayValue.INLINE_BLOCK) { display = "inline-block"; }
        div.style.display = display;

        if(this.ghost) { 
            topElem.style.zIndex = "-1";
        }
    }

    hasCustomPosition()
    {
        return this.position.get().hasValue() || this.offset.get().hasValue();
    }

    needsAbsolutePosition()
    {
        return this.ghost || this.anchor != AnchorValue.NONE || this.hasCustomPosition();
    }

    calc(c:Container) : BoxOutput
    {
        const b = new BoxOutput();
        let parentBox = c.getParentBox();
        b.preCalculate(this, parentBox);

        const usableParentSpace = b.usableParentSize.clone();
        super.calc(c, b, usableParentSpace);

        b.postCalculate(this, c);
        return b;
    }

}