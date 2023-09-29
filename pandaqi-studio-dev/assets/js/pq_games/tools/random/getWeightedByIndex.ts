import Bounds from "../numbers/bounds";
import lerp from "../numbers/lerp";
import getWeighted from "./getWeighted";

export default (arr:any[], desc = false, squish = 1.0) : number =>
{
    const dict = {};
    let bounds = new Bounds(1.0, squish*arr.length);
    bounds.sortAsc();

    for(let i = 0; i < arr.length; i++)
    {
        let factor = i / (arr.length - 1);
        if(desc) { factor = 1.0 - factor; }

        const prob = lerp(bounds.min, bounds.max, factor);
        dict[i] = { prob: prob }
    }

    const key = getWeighted(dict);
    return parseInt(key);
}