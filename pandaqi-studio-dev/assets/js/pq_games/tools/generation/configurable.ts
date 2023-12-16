import ColorSet from "js/pq_games/layout/color/colorSet";
import Configurator from "./configurator";

export default class Configurable
{
    val: any;
    input: string[];

    constructor(val:any, input:string|string[])
    {
        this.val = val;
        this.input = Array.isArray(input) ? input : [input];
    }

    calculate(c:Configurator)
    {
        if(this.input.length <= 0) { return this.val; }
        if(this.val instanceof ColorSet) { return this.val.select(c.get("inkFriendly")); }
        if(typeof this.val === "number")
        {
            let val = this.val;
            for(const input of this.input)
            {
                val *= c.get(input);
            }
            return val;
        }

    }
}