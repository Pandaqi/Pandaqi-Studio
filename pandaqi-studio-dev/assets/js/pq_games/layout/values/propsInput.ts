import ColorValue from "./colorValue"
import Value from "./value"
import NumberValue from "./numberValue"

import PropsOutput from "./propsOutput"
import Point from "js/pq_games/tools/geometry/point"
import FourSideValue from "./fourSideValue"

export default class PropsInput
{
    fill: ColorValue
    alpha: NumberValue
    borderRadius: FourSideValue
    z: NumberValue

    constructor(params:Record<string,any> = {})
    {
        this.fill = new ColorValue(params.fill ?? "transparent"); 
        this.alpha = new NumberValue(params.alpha ?? 1.0);  
        this.borderRadius = new FourSideValue(params.borderRadius ?? 0.0);
        this.z = new NumberValue((params.z ?? params.zIndex) ?? "auto");
    }

    applyToHTML(div:HTMLDivElement)
    {
        div.style.backgroundColor = this.fill.get();
        div.style.opacity = this.alpha.toCSS();
        div.style.borderRadius = this.borderRadius.toCSS();
        div.style.zIndex = this.z.toCSS();
    }

    // @TODO: These few functions are duplicates between boxInput and propsInput -- issue? refactor?
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

    // Any relative _properties_ depend on the size of their own container, not parent or child
    // Hence the difference in `calc` function between Box and Props
    calc(selfDims : Point) : PropsOutput
    {
        const b = new PropsOutput();
        const arr = this.getPropertyList();
        for(const prop of arr) 
        {
            b[prop as keyof PropsInput] = this.calcSafe(this[prop], selfDims);
        }
        return b;
    }

    calcSafe(val:any, selfDims : Point)
    {
        if(!(val instanceof Value)) { return val; }
        return val.calc(selfDims);
    }
}