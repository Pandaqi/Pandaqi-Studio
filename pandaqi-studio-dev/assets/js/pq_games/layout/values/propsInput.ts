import ColorValue from "./colorValue"
import Value from "./value"
import NumberValue from "./numberValue"

import PropsOutput from "./propsOutput"
import Point from "js/pq_games/tools/geometry/point"
import FourSideValue from "./fourSideValue"
import InputGroup from "./inputGroup"
import Container from "../containers/container"

export default class PropsInput extends InputGroup
{
    fill: ColorValue
    alpha: NumberValue
    borderRadius: FourSideValue
    z: NumberValue

    constructor(params:Record<string,any> = {})
    {
        super(params);

        this.fill = new ColorValue(params.fill ?? "transparent"); 
        this.alpha = new NumberValue(params.alpha ?? 1.0);  
        this.borderRadius = new FourSideValue(params.borderRadius ?? 0.0);
        this.z = new NumberValue((params.z ?? params.zIndex) ?? "auto");
    }

    applyToHTML(div:HTMLElement)
    {
        div.style.backgroundColor = this.fill.get();
        div.style.opacity = this.alpha.toCSS();
        div.style.borderRadius = this.borderRadius.toCSS();
        div.style.zIndex = this.z.toCSS();
    }

    calc(c:Container)
    {
        const p = new PropsOutput();
        return super.calc(c, p);
    }
}