import Color from "js/pq_games/layout/color/color";
import ColorSet from "js/pq_games/layout/color/colorSet";
import Point from "../geometry/point";

export default class CVal
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

        // @NOTE: any type of class or object must currently be handled separately (as we don't know what multiplication MEANS for it)
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

            const isPoint = value instanceof Point;    
            const isNumber = typeof value === "number";
            if(isNumber || isPoint)
            {
                let tempVal = new Point(value);
                for(const input of inputs)
                {
                    tempVal.scale(input);
                }

                const finalVal = isNumber ? tempVal.x : tempVal;
                results.push(finalVal);
            }
        }

        if(results.length == 1) { return results[0]; }
        return results;
    }
}