import getWeighted from "js/pq_games/tools/random/getWeighted";
import { CONTRACT_TEST_COMPARE, CONTRACT_TEST_NUMBER, CONTRACT_TEST_WHAT } from "../../js_shared/dict";
import ContractPart from "./contractPart";

export default class ContractTest extends ContractPart
{
    what: string
    compare: string
    number: string
    isBattle: boolean;

    generate(set:string, isBattle:boolean)
    {
        this.isBattle = isBattle;

        this.what = getWeighted(this.filterBySet(CONTRACT_TEST_WHAT, set, isBattle));

        const requiredCompare = CONTRACT_TEST_WHAT[this.what].requireCompare ?? [];

        const compareDictOriginal = this.filterBySet(CONTRACT_TEST_COMPARE, set, isBattle);
        const compareDict = structuredClone(compareDictOriginal);
        for(const key of Object.keys(compareDictOriginal))
        {
            if(requiredCompare.length > 0 && !requiredCompare.includes(key)) 
            { 
                delete compareDict[key];
                continue;
            }

            const filter = compareDict[key].filterWhat ?? [];
            if(filter.length <= 0) { continue; }
            if(filter.includes(this.what)) { continue; }
            delete compareDict[key];
        }

        this.compare = getWeighted(compareDict);

        const noNumber = compareDict[this.compare].noNumber;
        this.number = noNumber ? "empty" : getWeighted(this.filterBySet(CONTRACT_TEST_NUMBER, set, isBattle));
        super.generate();
    }

    getFinalString()
    {
        if(this.isBattle) { return this.getFinalStringBattle(); }
        return this.getFinalStringRegular();
    }

    getFinalStringRegular()
    {
        let strNum = CONTRACT_TEST_NUMBER[this.number].desc;
        if(strNum.length > 0) { strNum = " " + strNum; }
        return CONTRACT_TEST_WHAT[this.what].desc + " must be " + CONTRACT_TEST_COMPARE[this.compare].desc + strNum  + ".";
    }

    getFinalStringBattle()
    {
        const isLoop = (this.contract.do.frequency == "loop");
        const stringWhat = CONTRACT_TEST_WHAT[this.what].descBattle;
        const stringCompare = CONTRACT_TEST_COMPARE[this.compare].desc;
        const stringThreshold = CONTRACT_TEST_NUMBER[this.number].desc;

        if(isLoop) { return "You win if " + stringWhat.toLowerCase() + " " + stringCompare + " that of the previous player."; }
        return stringWhat + " " + stringCompare + " " + stringThreshold; 
    }

    getDifficulty()
    {
        return (CONTRACT_TEST_WHAT[this.what].diff ?? 1) + (CONTRACT_TEST_COMPARE[this.compare].diff ?? 1) + (CONTRACT_TEST_NUMBER[this.number].diff ?? 1);
    }
}