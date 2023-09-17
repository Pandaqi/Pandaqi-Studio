import ColorValue from "../colorValue"
import NumberValue from "../numberValue"
import LayoutNode from "../../layoutNode"
import FourSideValue from "../fourSideValue"

import PropsOutput from "./propsOutput"

import InputGroup from "./inputGroup"

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

    applyToHTML(div:HTMLElement)
    {
        div.style.backgroundColor = this.fill.get();
        div.style.opacity = this.alpha.toCSS();
        div.style.borderRadius = this.borderRadius.toCSS();
        div.style.zIndex = this.z.toCSS();
    }

    calc(c:LayoutNode)
    {
        const p = new PropsOutput();
        return super.calc(c, p);
    }
}