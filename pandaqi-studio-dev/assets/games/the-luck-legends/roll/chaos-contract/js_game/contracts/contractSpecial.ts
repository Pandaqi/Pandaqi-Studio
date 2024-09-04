import getWeighted from "js/pq_games/tools/random/getWeighted";
import { CONTRACT_SPECIAL } from "../../js_shared/dict";
import ContractPart from "./contractPart";

export default class ContractSpecial extends ContractPart
{
    special:string

    generate(set:string, isBattle:boolean)
    {
        this.special = getWeighted(this.filterBySet(CONTRACT_SPECIAL, set, isBattle));
        super.generate();
    }

    getFinalString()
    {
        const str = CONTRACT_SPECIAL[this.special].desc;
        if(str.length <= 0) { return ""; }
        return str + ".";
    }

    getDifficulty()
    {
        return (CONTRACT_SPECIAL[this.special].diff ?? 1);
    }
}