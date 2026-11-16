export default class Type
{
    type:string
    num:number

    constructor(type = null, num = 0)
    {
        this.type = type;
        this.num = num;
    }

    setNum(num:number) { this.num = num; }
    getNum() { return this.num; }
}