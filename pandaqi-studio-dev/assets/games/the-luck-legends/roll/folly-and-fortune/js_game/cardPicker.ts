import getWeighted from "js/pq_games/tools/random/getWeighted";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { ACTIONS, ActionType, GeneralData } from "../js_shared/dict";
import Card from "./card";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateBaseCards();
        this.generateSuperPowers();

        console.log(this.cards);
    }

    filterBySet(dict:Record<string,GeneralData>, set:string)
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

    getNumbersBalanced(num:number, list:number[])
    {
        const numCardsPerNumber = Math.ceil(num / list.length);
        const numbersFinal = [];
        for(let i = 0; i < list.length; i++)
        {
            for(let a = 0; a < numCardsPerNumber; a++)
            {
                numbersFinal.push(list[i]);
            }
        }
        shuffle(numbersFinal);

        return numbersFinal;
    }

    getActionsBalanced(num:number, options:Record<string,GeneralData>, set: string)
    {
        const actionsFinal = [];
        const actionsAvailable = this.filterBySet(options, set);
        for(const key of Object.keys(actionsAvailable))
        {
            actionsFinal.push([ key ]);
        }

        // @TODO: do the combination trick for UNSEEN actions

        while(actionsFinal.length < num)
        {
            actionsFinal.push([ getWeighted(actionsAvailable, "prob") ]);
        }
        shuffle(actionsFinal);

        return actionsFinal;
    }

    // This is COMPLETELY random (based on weights), with no guarantees whatsoever
    // I consider this fine, as the number of cards is large enough, and it's an expansion so it's not that necessary that actions are all present
    // Also, we have way too many unique actions anyway, so it's fine if this randomly shrinks the set a bit
    getActionsDynamic(num:number, options:Record<string,GeneralData>, set: string)
    {
        const actionsAvailable = this.filterBySet(options, set);
        const combinableActions = [];
        for(const [key,data] of Object.entries(options))
        {
            if(!data.canCombine) { continue; }
            combinableActions.push(key);
        }

        const actionsFinal = [];

        while(actionsFinal.length < num)
        {
            const baseAction = getWeighted(actionsAvailable, "prob");
            const duoFinal = [baseAction];

            const needsCombo = options[baseAction].type == ActionType.UNSEEN;
            if(needsCombo)
            {
                const comboAction = fromArray(combinableActions);
                duoFinal.unshift(comboAction);
            }

            actionsFinal.push(duoFinal);
        }
        shuffle(actionsFinal);

        return actionsFinal;
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        // prepare a fairly balanced set of numbers
        // prepare a fairly balanced set of actions; include at least once, then draw weighted
        const numCards = CONFIG.generation.baseCardsNum;
        const numbersFinal = this.getNumbersBalanced(numCards, CONFIG.generation.baseNumbersPossible);
        const actionsFinal = this.getActionsBalanced(numCards, ACTIONS, "base");

        // assign to cards
        for(let i = 0; i < numCards; i++)
        {
            const randNum = numbersFinal.pop();
            const newCard = new Card(randNum, this.getHealthFromNumber(randNum), actionsFinal.pop());
            this.cards.push(newCard);
        }
    }

    generateSuperPowers()
    {
        if(!CONFIG.sets.superPowers) { return; }

        const numCards = CONFIG.generation.superCardsNum;
        const numbersFinal = this.getNumbersBalanced(numCards, CONFIG.generation.superNumbersPossible);
        const actionsFinal = this.getActionsDynamic(numCards, ACTIONS, "superPowers");

        for(let i = 0; i < numCards; i++)
        {
            const randNum = numbersFinal.pop();
            const randAction = actionsFinal.pop();

            let isUnseen = false;
            for(const action of randAction)
            {
                if(ACTIONS[action].type != ActionType.UNSEEN) { continue; }
                isUnseen = true;
                break;
            }

            const newCard = new Card(randNum, this.getHealthFromNumber(randNum, isUnseen), randAction);
            this.cards.push(newCard);
        }
    }

    getHealthFromNumber(num:number, isUnseen = false)
    {
        let numHealthRaw = CONFIG.generation.numHealthPerNumber[num] ?? CONFIG.generation.defHealth;
        if(isUnseen) { numHealthRaw += CONFIG.generation.numHealthReductionUnseen; }
        const numHealthRandomness = CONFIG.generation.numHealthRandomness.random();
        return Math.max(Math.min( Math.round(numHealthRaw + numHealthRandomness), CONFIG.generation.numHealthMax), CONFIG.generation.numHealthMin);
    }
}