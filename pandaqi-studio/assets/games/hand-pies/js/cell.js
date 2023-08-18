export default class Cell
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
        this.type = null; // ingredient, machine, money, tutorial
        this.subType = null; // the specific ingredient, machine or tutorial
        this.reservedFor = null;
        this.num = 0; // purchase cost for ingredient/machine, actual value for money
        this.fixedFingers = [];
        this.tutorial = false;
    }

    setTypeObject(t)
    {
        this.setType(t.mainType);
        this.setSubType(t.subType);
        this.setNum(t.num);
        this.setTutorial(t.tutorial);
    }

    setType(t) { this.type = t; }
    getType() { return this.type; }
    hasType() { return this.type !== null; }
    
    setSubType(t) { this.subType = t; }
    getSubType() { return this.subType; }
    hasSubType() { return this.type !== null; }

    setTutorial(t) { this.tutorial = t; }
    isTutorial() { return this.tutorial; }

    markReservedFor(otherCell) { this.reservedFor = otherCell; }
    isReserved() { return this.reservedFor !== null; }

    isUsed() { return this.hasType() || this.isReserved(); }

    setNum(n) { this.num = n; }
    getNum() { return this.num; }
    hasNum() { return this.num > 0; }

    setFixedFingers(f) { this.fixedFingers = f; }
    getFixedFingers() { return this.fixedFingers; }
    hasFixedFingers() { return this.fixedFingers.length > 0; }

    hasExtraData() { 
        return this.hasFixedFingers() || (this.hasNum() && this.type != "money");
    }
}