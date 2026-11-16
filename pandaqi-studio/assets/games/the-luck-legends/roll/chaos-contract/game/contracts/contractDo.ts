
import { getWeighted } from "lib/pq-games";
import { CONTRACT_DO_FREQ, CONTRACT_DO_MOD, CONTRACT_DO_WHO } from "../../shared/dict";
import ContractPart from "./contractPart";

export default class ContractDo extends ContractPart
{
    who: string
    frequency: string
    mod: string

    generate(set:string, isBattle:boolean)
    {
        this.who = getWeighted(this.filterBySet(CONTRACT_DO_WHO, set, isBattle));
        this.frequency = getWeighted(this.filterBySet(CONTRACT_DO_FREQ, set, isBattle));
        this.mod = getWeighted(this.filterBySet(CONTRACT_DO_MOD, set, isBattle));
        super.generate();
    }

    getFinalString()
    {
        let strMod = CONTRACT_DO_MOD[this.mod].desc;
        if(strMod.length > 0) { strMod = " <col hex=\"#6799a0\">" + strMod + "</col>"; }
        return "<col hex=\"#7095dd\">" + CONTRACT_DO_WHO[this.who].desc + "</col> roll <col hex=\"#cf5cfd\">" + CONTRACT_DO_FREQ[this.frequency].desc + "</col>" + strMod + ".";
    }

    getDifficulty()
    {
        return (CONTRACT_DO_WHO[this.who].diff ?? 1) + (CONTRACT_DO_FREQ[this.frequency].diff ?? 1) + (CONTRACT_DO_MOD[this.mod].diff ?? 1);
    }
}