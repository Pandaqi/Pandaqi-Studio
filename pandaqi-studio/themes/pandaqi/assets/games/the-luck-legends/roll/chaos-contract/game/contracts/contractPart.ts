import Contract, { StringReplace } from "./contract";
import { DYNAMIC_REPLACEMENTS, GeneralDict } from "../../shared/dict";
import { fromArray } from "lib/pq-games";

export default class ContractPart
{
    contract:Contract
    dynamicValues: StringReplace[]

    constructor(c:Contract)
    {
        this.contract = c;
    }

    generate(set:string = "base", isBattle:boolean = false)
    {
        this.fillDynamicValues();
    }

    getDifficulty() : number { return 0; }
    equals(c:ContractPart) : boolean 
    {
        for(const key of Object.keys(this))
        {
            const isArray = Array.isArray(this[key]);
            if(isArray && !this.arraysMatch(this[key], c[key])) { return false; }
            if(this[key] != c[key]) { return false; }
        }
        return true;
    }

    arraysMatch(a:StringReplace[], b:StringReplace[]) : boolean
    {
        if(a.length != b.length) { return false; }
        for(let i = 0; i < a.length; i++)
        {
            if(a[i].replacement != b[i].replacement) { return false; }
        }
        return true;
    }

    filterBySet(dict:GeneralDict, set:string, isBattle = false) : GeneralDict
    {
        const dictOut:GeneralDict = {};
        for(const [key,data] of Object.entries(dict))
        {
            const sets = data.sets ?? ["base", "lost"];
            if(!sets.includes(set)) { continue; }
            if(isBattle && !data.battle) { continue; }
            if(data.battleExclusive && !isBattle) { continue; }
            dictOut[key] = data;
        }
        return dictOut;
    }
    
    getFinalString() : string { return ""; }
    fillDynamicValues()
    {
        this.dynamicValues = [];

        let foundSomething = true;
        let str = this.getFinalString();
        while(foundSomething)
        {
            foundSomething = false;

            for(const [key,data] of Object.entries(DYNAMIC_REPLACEMENTS))
            {
                if(!str.includes(key)) { continue; }
                const option = fromArray(data);
                str = str.replace(key, option);
                this.dynamicValues.push({
                    needle: key,
                    replacement: option.toString()
                })
                foundSomething = true;
                break;
            }
        }
    }

    toString()
    {
        let str = this.getFinalString();
        for(const val of this.dynamicValues)
        {
            str = str.replace(val.needle, val.replacement);
        }
        return str;
    }
}