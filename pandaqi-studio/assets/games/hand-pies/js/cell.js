export default class Cell
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
        this.type = null; // ingredient, machine, money, tutorial
        this.subType = null; // the specific ingredient, machine or tutorial
        this.reservedFor = null;
        this.num = 0;
        this.fixedFingers = []; // @TODO
    }

    setTypeObject(t)
    {
        this.setType(t.mainType);
        this.setSubType(t.subType);
    }

    setType(t) { this.type = t; }
    getType() { return this.type; }
    hasType() { return this.type !== null; }
    
    setSubType(t) { this.subType = t; }
    getSubType() { return this.subType; }
    hasSubType() { return this.type !== null; }

    markReservedFor(otherCell) { this.reservedFor = otherCell; }
    isReserved() { return this.reservedFor !== null; }

    isUsed() { return this.hasType() || this.isReserved(); }

    setNum(n) { this.num = n; }
    getNum() { return this.num; }
}