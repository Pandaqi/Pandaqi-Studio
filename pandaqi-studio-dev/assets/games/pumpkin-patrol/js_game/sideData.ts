import { Type } from "../js_shared/dict";

export default class SideData
{
    type:string;
    number:number;
    subType: Type;

    constructor(tp:string, number:number, st:Type)
    {
        this.type = tp;
        this.number = number;
        this.subType = st;
    }
}