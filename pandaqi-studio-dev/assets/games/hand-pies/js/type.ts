export default class Type
{
    mainType:string
    subType:string
    num:number
    tutorial:boolean

    constructor(mainType:string, subType:string, num = 0, tutorial = false)
    {
        this.mainType = mainType;
        this.subType = subType;
        this.num = num;
        this.tutorial = tutorial;
    }

    setNum(num:number) { this.num = num; }
    getNum() { return this.num; }

    setTutorial(t:boolean) { this.tutorial = t; }
    getTutorial() { return this.tutorial; }
}