export default class ElementIcon
{
    type: string;
    action: boolean;

    constructor(type:string = "fire", action:boolean = false)
    {
        this.type = type;
        this.action = action;
    }
}