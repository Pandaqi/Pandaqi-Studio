import { MISSION_SCALARS } from "../js_shared/dict";

export default class MissionRequirement
{
    icon: string;
    scalar: string;
    num: number = 1;

    constructor(i:string, s:string)
    {
        this.icon = i;
        this.scalar = s;
    }

    getID()
    {
        return this.icon + "_" + this.scalar + "_" + Math.round(this.num);
    }

    factorNumber(f:number)
    {
        this.num = Math.min(Math.max(this.num * f, 0.25), 8.0);
    }

    getValue()
    {
        return (MISSION_SCALARS[this.scalar].value ?? 1.0) * this.num;
    }

}