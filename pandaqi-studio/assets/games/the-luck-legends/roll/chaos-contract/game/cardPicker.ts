import fromArray from "js/pq_games/tools/random/fromArray";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import { CARD_ACTIONS, CardType, GeneralDict } from "../shared/dict";
import Card from "./card";
import Contract from "./contracts/contract";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateBase();
        this.generateLostSouls();
        this.generateDevilishNumbers();

        console.log(this.cards);
    }

    generateBase()
    {
        if(!CONFIG.sets.base) { return; }

        this.generateContracts("base");
        this.generateDiceCards("base");
    }

    generateLostSouls()
    {
        if(!CONFIG.sets.lostSouls) { return; }

        this.generateContracts("lost");
    }

    generateDevilishNumbers()
    {
        if(!CONFIG.sets.devilishNumbers) { return; }

        this.generateDiceCards("devilish");
    }

    generateContracts(set:string)
    {
        const numContracts = CONFIG.generation.contractsNumPerSet[set] ?? CONFIG.generation.contractsNumDefault;

        // prepare the rewards/penalties in a balanced way
        const rewardNums = [];
        let totalRewards = 0;
        
        let dist:Record<number, number> = CONFIG.generation.contractRewardDist;
        for(const [num,freqRaw] of Object.entries(dist))
        {
            const freq = Math.ceil(freqRaw * parseInt(num) * numContracts);
            totalRewards += freq;
            for(let i = 0; i < freq; i++)
            {
                rewardNums.push(parseInt(num));
            }
        }
        shuffle(rewardNums);

        const penaltyNums = [];
        let totalPenalties = 0;

        dist = CONFIG.generation.contractPenaltyDist;
        for(const [num,freqRaw] of Object.entries(dist))
        {
            const freq = Math.ceil(freqRaw * parseInt(num) * numContracts);
            totalPenalties += freq;
            for(let i = 0; i < freq; i++)
            {
                penaltyNums.push(parseInt(num));
            }
        }
        shuffle(penaltyNums);

        const rewards = [];
        const penalties = [];
        const distType:Record<string,number> = CONFIG.generation.contractResultTypeDist;
        for(const [type,freqRaw] of Object.entries(distType))
        {
            const freqRewards = Math.ceil(freqRaw * totalRewards);
            const freqPenalties = Math.ceil(freqRaw * totalPenalties);
            for(let i = 0; i < freqRewards; i++) { rewards.push(type); }
            for(let i = 0; i < freqPenalties; i++) { penalties.push(type); }
        }
        shuffle(rewards);
        shuffle(penalties);

        // then actually create them
        
        const possibleTypes = CONFIG.generation.contractTypesPerSet[set] ?? CONFIG.generation.contractTypesDefault;
        for(let i = 0; i < numContracts; i++)
        {
            let c:Contract
            do {
                c = new Contract(fromArray(possibleTypes), set);
            } while(this.contractAlreadyExists(c));

            const newCard = new Card(CardType.CONTRACT);
            newCard.setContract(c);

            const reward = rewards.splice(0, rewardNums.pop());
            const penalty = penalties.splice(0, penaltyNums.pop());
            c.setResult(reward, penalty); 

            this.cards.push(newCard);
        }
    }

    filterBySet(dict:GeneralDict, set:string)
    {
        const dictOut = {};
        for(const [key,data] of Object.entries(dict))
        {
            const sets = data.sets ?? ["base"];
            if(!sets.includes(set)) { continue; }
            dictOut[key] = data;
        }
        return dictOut;
    }

    generateDiceCards(set:string)
    {
        const num = CONFIG.generation.cardsNumPerSet[set] ?? CONFIG.generation.cardsNumDefault;

        // prepare numbers randomly
        const possibleNumbers = CONFIG.generation.cardsPossiblePerSet[set] ?? CONFIG.generation.cardsPossibleDefault;
        const freqPerNumber = Math.ceil(num / possibleNumbers.length);
        const numbersFinal = [];
        for(const num of possibleNumbers)
        {
            for(let i = 0; i < freqPerNumber; i++)
            {
                numbersFinal.push(num);
            }
        }
        shuffle(numbersFinal);

        // prepare actions randomly
        const actionsPossible = this.filterBySet(CARD_ACTIONS, set);
        const actionsFinal = [];
        const actionPerc = CONFIG.generation.actionPercentagePerSet[set] ?? CONFIG.generation.actionPercentageDefault;
        const numActionsNeeded = Math.round(actionPerc * num);
        while(actionsFinal.length < numActionsNeeded)
        {
            actionsFinal.push(getWeighted(actionsPossible));
        }

        while(actionsFinal.length < num)
        {
            actionsFinal.push("");
        }
        shuffle(actionsFinal)

        const specialTypes:string[] = [];
        if(set == "devilish")
        {
            const wildcardFreq = Math.round(CONFIG.generation.wildcardPercentage * num);
            for(let i = 0; i < wildcardFreq; i++) { specialTypes.push("wildcard"); }
            
            const duoFreq = Math.round(CONFIG.generation.duoNumberPercentage * num);
            for(let i = 0; i < duoFreq; i++) { specialTypes.push("duo"); }
            
            while(specialTypes.length < num)
            {
                specialTypes.push("");
            }
            
            shuffle(specialTypes);
        }

        // assign to final cards
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(CardType.DICE);
            newCard.setDiceData(numbersFinal.pop(), actionsFinal.pop());
            
            if(specialTypes.length > 0)
            {
                newCard.setSpecialType(specialTypes.pop());
            }

            this.cards.push(newCard);
        }

    }

    contractAlreadyExists(c:Contract)
    {
        for(const card of this.cards)
        {
            if(card.type != CardType.CONTRACT) { continue; }
            if(!card.contract.equals(c)) { continue; }
            return true;
        }
        return false;
    }
}