import ColorValue from "../colorValue"
import NumberValue from "../numberValue"
import LayoutNode from "../../layoutNode"
import FourSideValue from "../fourSideValue"

import PropsOutput from "./propsOutput"

import InputGroup from "./inputGroup"
import LayoutOperation from "../../layoutOperation"
import ColorLike from "../../color/colorLike"
import { ElementLike } from "../../resources/resource"

export default class PropsInput extends InputGroup
{
    fill: ColorValue
    alpha: NumberValue
    borderRadius: FourSideValue
    z: NumberValue

    constructor(params:Record<string,any> = {})
    {
        super();

        this.fill = new ColorValue(params.fill ?? "transparent"); 
        this.alpha = new NumberValue(params.alpha ?? 1.0);  
        this.borderRadius = new FourSideValue(params.borderRadius ?? 0.0);
        this.z = new NumberValue((params.z ?? params.zIndex) ?? "auto");
    }

    clone()
    {
        const b = new PropsInput();
        return super.cloneInto(b);
    }

    applyToHTML(div:ElementLike)
    {
        //div.style.backgroundColor = this.fill.get();
        //div.style.opacity = this.alpha.toCSS();
        div.style.borderRadius = this.borderRadius.toCSS();
        div.style.zIndex = this.z.toCSS();
    }

    applyToLayoutOperation(op:LayoutOperation)
    {
        op.fill = new ColorLike(this.fill.get());
        op.alpha = this.alpha.get();
    }

    calc(c:LayoutNode)
    {
        const p = new PropsOutput();
        return super.calc(c, p);
    }
}