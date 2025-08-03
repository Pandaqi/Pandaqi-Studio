import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { POWERS } from "../shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    const suits = CONFIG._settings.suits.value;
    for(const suit of suits)
    {
        generateSuit(cards, suit);
    }

    assignPowers(cards);
    return cards;
}

const generateSuit = (cards:Card[], suit:string) =>
{
    const numbers = CONFIG.generation.numbers;
    const cardsPerNumber = CONFIG.generation.cardsPerNumber;
    for(const num of numbers)
    {
        for(let i = 0; i < cardsPerNumber; i++)
        {
            const card = new Card(suit, num);
            cards.push(card);
        }
        
    }
}

const assignPowers = (cardsInput:Card[]) =>
{
    if(!CONFIG._settings.includePowers.value) { return; }

    const powers = structuredClone(POWERS);

    // some cards never have a power; remove them now
    const cards = shuffle(cardsInput.slice());
    const noPowerNums = CONFIG.generation.numbersWithoutPower;
    for(let i = cards.length - 1; i >= 0; i--)
    {
        if(noPowerNums.includes(cards[i].num)) { cards.splice(i, 1); }
    }

    // as we assign powers, we track them to make sure none exceeds their maximum
    let powerFreqs = {};
    const registerPower = (powers, key) =>
    {
        if(!(key in powerFreqs)) { powerFreqs[key] = 0; }
        powerFreqs[key]++;
        const max = powers[key].max ?? Infinity;
        if(powerFreqs[key] >= max)
        {
            delete powers[key];
        }
    }

    // include each type at least once
    for(const [key,data] of Object.entries(powers))
    {
        const min = data.min ?? 1;
        for(let i = 0; i < min; i++)
        {
            if(cards.length <= 0) { break; }
            const c = cards.pop();
            c.power = key;
            registerPower(powers, key);
        }
    }

    // then fill it up by drawing randomly, with weighted probabilities (and max cap)
    while(cards.length > 0)
    {
        const randPower = getWeighted(powers);
        const c = cards.pop();
        c.power = randPower;
        registerPower(powers, randPower);
    }
}