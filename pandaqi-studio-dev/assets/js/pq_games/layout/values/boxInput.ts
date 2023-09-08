import TwoAxisValue from "./twoAxisValue"
import FourSideValue from "./fourSideValue"
import StrokeValue from "./strokeValue"
import Value from "./value"
import AnchorValue from "./anchorValue"
import NumberValue from "./numberValue"

import BoxOutput from "./boxOutput"
import Point from "js/pq_games/tools/geometry/point"
import Container from "../containers/container"


export default class BoxInput
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

    background: boolean

    constructor(params:Record<string,any> = {})
    {
        // basic positioning properties
        this.margin = new FourSideValue(params.margin);
        this.padding = new FourSideValue(params.padding);
        this.stroke = new StrokeValue(params.stroke);

        this.offset = new TwoAxisValue(params.offset ?? new Point());
        this.anchor = params.anchor ?? AnchorValue.NONE;
        this.keepRatio = new NumberValue(params.keepRatio ?? 0.0);

        this.background = params.background ?? false;

        // all the big size/dimension/location properties
        const pos = this.readTwoAxisParams(params, ["x", "y", "pos"]);
        this.position = new TwoAxisValue(pos);

        const posMin = this.readTwoAxisParams(params, ["xMin", "yMin", "posMin"], [0,0]);
        this.positionMin = new TwoAxisValue(posMin);

        const posMax = this.readTwoAxisParams(params, ["xMax", "yMax", "posMax"], [Infinity, Infinity]);
        this.positionMax = new TwoAxisValue(posMax);

        // @TODO: default => new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), 0);
        const size = this.readTwoAxisParams(params, ["width", "height", "size"]);
        this.size = new TwoAxisValue(size);

        const sizeMin = this.readTwoAxisParams(params, ["widthMin", "heightMin", "sizeMin"], [0, 0]);
        this.sizeMin = new TwoAxisValue(sizeMin);

        const sizeMax = this.readTwoAxisParams(params, ["widthMax", "heightMax", "sizeMax"], [Infinity, Infinity]);
        this.sizeMax = new TwoAxisValue(sizeMax);
    }

    readTwoAxisParams(params:Record<string,any>, props:string[], defs:any[] = [null,null])
    {
        let val = params[props[2]];
        if(val instanceof TwoAxisValue) { return val; }

        const valid = (val && "x" in val && "y" in val);
        if(valid) { return val; }
        
        val = {};
        if(!val.x) { val.x = params[props[0]] ?? defs[0]; }
        if(!val.y) { val.y = params[props[1]] ?? defs[1]; }
        return val;
    }

    getPropertyList() : string[]
    {
        const arr = [];
        for (const prop in this) 
        {
            arr.push(prop);
        }
        return arr;
    }

    dependsOnContent() : boolean
    {
        const list = this.getPropertyList();
        for (const prop in list) 
        {
            const val = this[prop]
            if(!(val instanceof Value)) { continue; }
            if(val.dependsOnContent()) { return true; }
        }
        return false;
    }

    calc(c:Container) : BoxOutput
    {
        const b = new BoxOutput();
        let parentBox = c.getParentBox();
        b.preCalculate(this, parentBox);

        // @TODO: this should just be a single Point on BoxOutput right?
        const usableParentSpace = new Point(b.usableParentWidth, b.usableParentHeight);
        let filledContentSpace = new Point().setXY(null, null);
        if(c.dimensionsContent) { filledContentSpace = c.dimensionsContent.getSize(); }

        const arr = this.getPropertyList();
        for(const prop of arr) 
        {
            b[prop as keyof BoxInput] = this.calcSafe(this[prop], usableParentSpace, filledContentSpace);
        }

        // @TODO: put this check inside flowOutput? Is that cleaner?
        if(c.isFlowItem())
        {
            c.flowOutput.applyToBox(b);
        }

        b.postCalculate(this);
        return b;
    }

    calcSafe(val:any, pDims : Point, cDims : Point) : any
    {
        if(!(val instanceof Value)) { return val; }
        return val.calc(pDims, cDims);
    }
}