import { MAIN_TYPES } from "../shared/dict"

export default class Type
{
    mainType:string
    subType:string
    num:number
    tutorial:boolean
    fixedFingers:number[]

    constructor(mainType:string, subType:string, num = 0, tutorial = false)
    {
        this.mainType = mainType;
        this.subType = subType;
        this.num = num;
        this.tutorial = tutorial;
        this.fixedFingers = [];
    }

    setNum(num:number) { this.num = num; }
    getNum() { return this.num; }

    setTutorial(t:boolean) { this.tutorial = t; }
    getTutorial() { return this.tutorial; }

    getPower() : number
    { 
        return MAIN_TYPES[this.mainType].DICT[this.subType].power ?? 0;
    }

    getData()
    {
        return MAIN_TYPES[this.mainType].DICT[this.subType];
    }

    setFixedFingers(f:number[])
    {
        this.fixedFingers = f;
    }
}