import Color from "js/pq_games/layout/color/color";
import ColorSet from "js/pq_games/layout/color/colorSet";

export default class Configurable
{
    val: any;
    input: string[];

    constructor(val:any, input:string|string[])
    {
        this.val = val;
        this.input = Array.isArray(input) ? input : [input];
    }

    getInput() { return this.input; }

    calculate(inputs:any[])
    {
        if(inputs == null) { return this; }
        if(this.input.length <= 0) { return this.val; }

        // this is mostly to support arrays to be calculated all at once (like vector-scalar multiplication)
        // in almost all cases, the value will just be a single number
        const values = Array.isArray(this.val) ? this.val : [this.val];
        const results = [];

        for(const value of values)
        {
            const isColorSet = value instanceof ColorSet;
            if(isColorSet) 
            { 
                results.push( value.select(inputs[0]) ); // first input should be inkfriendly boolean 
            }
    
            const isColor = value instanceof Color;
            if(isColor) { /* @TODO? */ }

            const isString = typeof this.val === "string";
            if(isString) { /* @TODO? */ }
    
            const isNumber = typeof value === "number";
            if(isNumber)
            {
                let finalVal = value;
                for(const input of inputs)
                {
                    finalVal *= input;
                }
                results.push( finalVal );
            }
        }

        return results;
    }
}