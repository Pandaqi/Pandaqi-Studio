import { Vector2 } from "lib/pq-games"
import { MAIN_TYPES, COLOR_GROUPS } from "../shared/dict"
import Type from "./type"

export default class Cell
{
    x:number
    y:number
    mainType:string
    subType:string
    reservedFor:Cell
    num:number
    fixedFingers:number[]
    tutorial:boolean
    polygon:any[]

    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
        this.mainType = null; // ingredient, machine, money, tutorial
        this.subType = null; // the specific ingredient, machine or tutorial
        this.reservedFor = null;
        this.num = 0; // purchase cost for ingredient/machine, actual value for money
        this.fixedFingers = [];
        this.tutorial = false;
        this.polygon = null;
    }

    getPosition()
    {
        return new Vector2(this.x, this.y);
    }

    getTypeData()
    {
        if(!this.mainType || !this.subType || this.reservedFor) { return {}; }
        return MAIN_TYPES[this.mainType].DICT[this.subType];
    }

    getColorGroup() : string
    {
        if(this.reservedFor) { return "reserved"; }
        if(this.tutorial) { return "tutorial"; }
        if(this.mainType == "machine") { return "machine"; }
        else if(this.mainType == "money") { return "money"; }
        return this.getTypeData().colorGroup;
    }

    getColor() : string
    {
        return COLOR_GROUPS[this.getColorGroup()] ?? "#FFFFFF";
    }

    setTypeObject(t:Type)
    {
        this.setMainType(t.mainType);
        this.setSubType(t.subType);
        this.setNum(t.num);
        this.setTutorial(t.tutorial);
        this.setFixedFingers(t.fixedFingers);
    }

    setMainType(t:string) { this.mainType = t; }
    getMainType() { return this.mainType; }
    hasMainType() { return this.mainType !== null; }
    
    setSubType(t:string) { this.subType = t; }
    getSubType() { return this.subType; }
    hasSubType() { return this.subType !== null; }

    setTutorial(t:boolean) { this.tutorial = t; }
    isTutorial() { return this.tutorial; }

    markReservedFor(otherCell:Cell) { this.reservedFor = otherCell; }
    isReserved() { return this.reservedFor !== null; }

    isUsed() { return this.hasMainType() || this.isReserved(); }

    setNum(n:number) { this.num = n; }
    getNum() { return this.num; }
    hasNum() { return this.num > 0; }

    setFixedFingers(f:number[]) { this.fixedFingers = f ?? []; }
    getFixedFingers() { return this.fixedFingers; }
    hasFixedFingers() { return this.fixedFingers.length > 0; }

    hasExtraData() { 
        return this.hasFixedFingers() || (this.hasNum() && this.mainType != "money");
    }
}