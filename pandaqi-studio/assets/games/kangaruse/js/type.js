export default class Type
{
    constructor(type = null, num = 0)
    {
        this.type = type;
        this.num = num;
    }

    setNum(n) { this.num = num; }
    getNum() { return this.num; }
}