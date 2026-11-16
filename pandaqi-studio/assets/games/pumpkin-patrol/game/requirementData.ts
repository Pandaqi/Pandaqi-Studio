import { CONFIG } from "../shared/config";
import { ReqType } from "../shared/dict";

export default class RequirementData
{
    reqType: ReqType
    icons:string[];
    atMost:boolean;
    num: number;
    useUniqueSets: boolean;

    constructor(reqType:ReqType, icons:string[], num:number, useUniqueSets)
    {
        this.reqType = reqType;
        this.icons = icons;
        this.num = num;
        this.atMost = false;
        this.useUniqueSets = useUniqueSets;
        this.fillIconList();
    }

    flip() { this.atMost = true; }
    sort()
    {
        this.icons.sort((a,b) => { return a.localeCompare(b); }) 
    }
    isRegular() { return this.reqType == ReqType.TYPE; }

    // special types have no fixed icons set
    // they just fill the whole thing with the specific key needed to display their type
    fillIconList()
    {
        if(this.icons.length > 0 || this.isRegular()) { return; }
        let key = "card";
        if(this.reqType == ReqType.SET)
        {
            key = "set";
            if(this.useUniqueSets) { key += "_unique"; }
        }
        this.icons = new Array(this.num).fill(key);
    }

    getTotalValue()
    {
        let sum = 0;
        if(this.isRegular()) {
            for(const elem of this.get()) { sum += CONFIG.allCards[elem].value; }
        } else {
            sum = this.count();
        }
        return sum;
    }
    get() 
    { 
        return this.icons; 
    }

    count() { return this.get().length; }
    add(icon:string)
    {
        this.icons.push(icon);
    }
}