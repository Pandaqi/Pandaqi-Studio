import Point from "js/pq_games/tools/geometry/point";
import Container from "../containers/container";
import Value from "./value";
import TwoAxisValue from "./twoAxisValue";

export default class InputGroup
{
    constructor(params:Record<string,any>)
    {

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

    calc(c:Container, output:any, parentDims:Point = null, contentDims:Point = null)
    {
        const arr = this.getPropertyList();
        console.log(c);
        console.log(c.boxOutput);
        parentDims = parentDims ?? c.boxOutput.getSize();
        if(c.dimensionsContent) { contentDims = c.dimensionsContent.getSize(); }
        contentDims = contentDims ?? new Point();

        for(const prop of arr) 
        {
            output[prop] = this.calcSafe(this[prop], parentDims, contentDims);
        }

        return output;
    }

    calcSafe(val:any, parentDims:Point, contentDims:Point)
    {
        if(!(val instanceof Value)) { return val; }
        return val.calc(parentDims, contentDims);
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

    applyToHTML(div:HTMLDivElement, wrapper:HTMLDivElement = null, parent:Container = null) { }
}