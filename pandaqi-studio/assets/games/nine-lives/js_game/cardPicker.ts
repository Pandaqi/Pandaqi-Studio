import arraysAreDuplicates from "js/pq_games/tools/collections/arraysAreDuplicates";
import CONFIG from "../js_shared/config";
import { CATS, POWERS, Type } from "../js_shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import initArrayOfArrays from "js/pq_games/tools/collections/initArrayOfArrays";
import getAllPossibleCombinations from "js/pq_games/tools/collections/getAllPossibleCombinations";
import numberRange from "js/pq_games/tools/collections/numberRange";
import shuffle from "js/pq_games/tools/random/shuffle";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }

    generate()
    {
        this.cards = [];
        this.generateCatCards();
        this.generateLifeCards();
    }

    countEntries(a)
    {
        let sum = 0;
        for(const elem of a)
        {
            if(Array.isArray(elem)) { sum += elem.length; }
            else { sum += 1; }
        }
        return sum;
    }

    generateCatCards()
    {
        if(!CONFIG.includeCatCards) { return; }

        const maxCatsOnComboCard = CONFIG.generation.numberCards.maxCatsOnComboCard; // @DEBUGGING: keep it low to prevent hanging/infinite loop issues
        const maxCatsOnRegularCard = CONFIG.generation.numberCards.maxCatsOnRegularCard;
        const maxCards = CONFIG.generation.numberCards.num;

        // get ALL possible combos
        const combos = initArrayOfArrays(maxCatsOnRegularCard+1);
        const optionsWithCombo = [];
        const optionsNoCombo = [];
        for(const [key,data] of Object.entries(CATS))
        {
            if(data.excludeFromCombos) { optionsNoCombo.push(key); continue; }
            optionsWithCombo.push(key);
        }

        for(let i = 1; i <= maxCatsOnComboCard; i++)
        {
            combos[i] = getAllPossibleCombinations(optionsWithCombo, i);
        }

        console.log("[Generator] # Combos: " + this.countEntries(combos));

        const fillerOptions = structuredClone(combos); // this list will contain options we can use to fill the gap between current cards and desired deck size

        const finalCards = initArrayOfArrays(maxCatsOnRegularCard+1);
        const numNoComboCards = optionsNoCombo.length * maxCatsOnRegularCard;
        let cardsLeft = maxCards;
        cardsLeft -= numNoComboCards;

        // all combos until this limit are included by default, for sure
        const includeAllCombosUntil = CONFIG.generation.numberCards.includeAllCombosUntil;
        for(let i = 1; i <= includeAllCombosUntil; i++)
        {
            const arr = combos[i];
            finalCards[i] = arr;
            cardsLeft -= arr.length;

            if(i == includeAllCombosUntil) { fillerOptions.push(arr); }
        }

        // all numbers above that fill the space left, weighted towards lower numbers
        // (so lower #cats on card appears more often than higher #cats)
        let curWeight = 1;
        let totalWeight = 0;
        const range = numberRange(includeAllCombosUntil+1, maxCatsOnComboCard);
        const weightsPerLayer = [];
        const numFalloff = CONFIG.generation.numberCards.highComboFalloff;
        for(const num of range)
        {
            totalWeight += curWeight;
            weightsPerLayer[num] = curWeight;
            curWeight /= numFalloff;
        }

        const cardsLeftWeighted = cardsLeft / totalWeight;
        const cardsPerLayer = [];
        let totalIconsWanted = 0;
        for(const num of range)
        {
            const cardsToPick = Math.floor(cardsLeftWeighted * weightsPerLayer[num]);
            cardsPerLayer[num] = cardsToPick;
            totalIconsWanted += cardsToPick * num;
        }

        // we basically say that no type may be SO frequent that it's basically the same as two types
        const maxIconsWantedPerType = totalIconsWanted / (optionsWithCombo.length - 1);
        const wouldExceedLimit = (combo:number[], stats:Record<string, number>) =>
        {
            const newStats = Object.assign({}, stats);
            for(const elem of combo)
            {
                newStats[elem] += 1;
            }
        
            for(const stat of Object.values(newStats))
            {
                if(stat > maxIconsWantedPerType) { return true; }
            }
            return false;
        }

        // while appointing, we do track how often each type appears, 
        // to make sure we don't get an extremely lopsided distribution
        const numIncludedPerType = {};
        for(const key of Object.keys(CATS)) { numIncludedPerType[key] = 0; }

        for(const num of range)
        {
            const options = shuffle(combos[num].slice())
            const cardsToPick = cardsPerLayer[num];

            const list = [];
            for(let i = 0; i < cardsToPick; i++)
            {
                // find the first option that fits (if none fits, pick random)
                let idx = rangeInteger(0, options.length-1);
                for(let a = 0; a < options.length; a++)
                {
                    if(wouldExceedLimit(options[a], numIncludedPerType)) { continue; }
                    break;
                }

                // save its stats
                const option = options[idx];
                for(const elem of option)
                {
                    numIncludedPerType[elem]++;
                }

                // add to list, make unpickable from now on
                list.push(option);
                cardsLeft--;
                options.splice(idx, 1);
            }

            finalCards[num] = list;
            fillerOptions.push(options);
        }

        // create all non-combo cards
        // (these are extremely simple to make, but they come now because they should NOT influence the combos above)
        // (their influence on cardsLeft is already calculated above)
        for(const option of optionsNoCombo)
        {
            for(let i = 1; i <= maxCatsOnRegularCard; i++)
            {
                const arr = new Array(i).fill(option);
                finalCards[i].push(arr);
                fillerOptions[i].push(arr);
            }
        }

        // fill remaining space with a specific type of card
        const fillerOptionsFlat = shuffle(fillerOptions.flat());
        while(cardsLeft > 0)
        {
            const combo = fillerOptionsFlat.pop();
            const num = combo.length;
            finalCards[num].push(combo);
            cardsLeft--;
        }

        // finally, actually use all those combo lists to create the actual cards
        for(const layer of finalCards)
        {
            for(const cardData of layer)
            {
                const newCard = new Card(Type.CAT);
                newCard.cats = cardData;
                this.cards.push(newCard);
            }
        }

        console.log(numIncludedPerType);
        
    }

    generateFullPowersDictionary()
    {
        const powersToRemove = [];
        const powersToAdd = {};

        const allCatOptions = Object.keys(CATS);
        const powerDict = structuredClone(POWERS);
        for(const [key,data] of Object.entries(powerDict))
        {
            const notIncludedInSet = CONFIG.limitedPowers && !data.core;
            if(notIncludedInSet) { powersToRemove.push(key); continue; }

            const needsNoFurtherGeneration = !data.reqs || data.reqs.length <= 0;
            if(needsNoFurtherGeneration) { continue; }
            
            powersToRemove.push(key);

            const reqs = data.reqs;

            const catOptions = allCatOptions.slice();
            const numberOptions = ["1","2","3","4","5"];

            const options1 = reqs[0] == "cat" ? catOptions : numberOptions;
            const options2 = reqs.length >= 2 ? (reqs[1] == "cat" ? catOptions : numberOptions) : [];

            for(const option1 of options1)
            {
                let key1 = key + "_" + option1;
                
                if(options2.length > 0) {
                    for(const option2 of options2)
                    {
                        if(option2 == option1) { continue; }
                        const dataCopy = structuredClone(data);
                        let key2 = key1 + "_" + option2;
                        dataCopy.reqs = [option1, option2];
                        powersToAdd[key2] = dataCopy;
                    }
                } else {
                    const dataCopy = structuredClone(data);
                    dataCopy.reqs = [option1];
                    powersToAdd[key1] = dataCopy;
                }
            }
        }

        for(const power of powersToRemove)
        {
            delete powerDict[power];
        }

        for(const [key,data] of Object.entries(powersToAdd))
        {
            powerDict[key] = data;
        }

        console.log(powerDict);

        return powerDict;
    }

    generateLifeCards()
    {
        if(!CONFIG.includeLifeCards) { return; }

        const powers = this.generateFullPowersDictionary();
        const numCards = CONFIG.generation.lifeCards.num;
        
        const cardTypes = [];

        // include each power at least once
        for(const key of Object.keys(powers))
        {
            cardTypes.push(key);
        }

        // then just draw randomly based on probability
        while(cardTypes.length < numCards)
        {
            const randType = getWeighted(powers);
            cardTypes.push(randType);
        }

        for(const type of cardTypes)
        {
            const newCard = new Card(Type.LIFE);
            newCard.power = type;
            newCard.data = powers[type];
            this.cards.push(newCard);
        }
    }

    removeCardsBelow(num:number)
    {
        const arr = [];
        for(const card of this.cards)
        {
            if(card.type != Type.CAT) { continue; }
            if(card.cats.length < num) { continue; }
            arr.push(card);
        }
        this.cards = arr;
    }
}