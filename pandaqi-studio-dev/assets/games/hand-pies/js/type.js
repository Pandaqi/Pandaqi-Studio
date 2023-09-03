export default class Type
{
    constructor(mainType, subType, num = 0, tutorial = false)
    {
        this.mainType = mainType;
        this.subType = subType;
        this.num = num;
        this.tutorial = tutorial;
    }

    setNum(num) { this.num = num; }
    getNum() { return this.num; }

    setTutorial(t) { this.tutorial = t; }
    getTutorial() { return t; }
}