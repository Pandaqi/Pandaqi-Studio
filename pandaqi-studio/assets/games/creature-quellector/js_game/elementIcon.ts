export default class ElementIcon
{
    type: string;
    action: boolean;
    multi: string;

    constructor(type:string = "fire", action:boolean = false, multi:string = "")
    {
        this.type = type;
        this.action = action;
        this.multi = multi;
    }
}