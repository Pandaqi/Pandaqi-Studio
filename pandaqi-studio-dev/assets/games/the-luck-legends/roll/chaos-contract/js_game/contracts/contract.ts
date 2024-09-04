import { ContractType } from "../../js_shared/dict";
import ContractDo from "./contractDo";
import ContractSpecial from "./contractSpecial";
import ContractTest from "./contractTest";

interface StringReplace
{
    needle: string,
    replacement: string
}

export type { StringReplace };
export default class Contract
{
    do: ContractDo
    test: ContractTest
    special: ContractSpecial
    type: ContractType
    minTurnout: number;

    rewards:string[];
    penalties:string[];

    constructor(tp:ContractType = ContractType.REGULAR, set:string = "base")
    {
        this.type = tp;

        this.minTurnout = 1;
        if(this.type == ContractType.FORCED)
        {
            this.minTurnout = Math.random() <= 0.5 ? 2 : 3;
        }

        const isBattle = this.type == ContractType.BATTLE;

        this.do = new ContractDo(this)
        this.do.generate(set, isBattle);

        this.test = new ContractTest(this)
        this.test.generate(set, isBattle);

        this.special = new ContractSpecial(this)
        this.special.generate(set, isBattle);
    }

    setResult(r:string[], p:string[])
    {
        this.rewards = r;
        this.penalties = p;
    }

    toString()
    {
        return this.do.toString() + "\n" + this.test.toString() + "\n" + this.special.toString();
    }

    equals(c:Contract)
    {
        return this.do.equals(c.do) && this.test.equals(c.test) && this.special.equals(c.special);
    }

    getDifficulty() : number
    {
        return this.do.getDifficulty() + this.test.getDifficulty() + this.special.getDifficulty();
    }

    getStars()
    {
        return Math.max(Math.min(Math.round(0.33*this.getDifficulty()), 3), 1);
    }
}