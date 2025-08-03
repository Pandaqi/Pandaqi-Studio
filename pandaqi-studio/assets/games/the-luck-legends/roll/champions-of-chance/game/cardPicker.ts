import Bounds from "js/pq_games/tools/numbers/bounds";
import { CONFIG } from "../shared/config";
import Card from "./card";
import { SPECIAL_CARDS } from "../shared/dict";
import shuffle from "js/pq_games/tools/random/shuffle";

export const cardPicker = () : Card[] =>
{
    const cards = [];

    generateBaseCards(cards);
    generateWackyNumbers(cards);

    return cards;
}

const generateBaseCards = (cards) =>
{
    if(!CONFIG.sets.base) { return; }

    for(let i = CONFIG.generation.minNum; i <= CONFIG.generation.maxNum; i++)
    {
        for(let a = 0; a < CONFIG.generation.numCardsPerNumber; a++)
        {
            const numIcons = getNumIconsFromNumber(i);
            cards.push(new Card(i, numIcons));
        }
    }
}

const generateWackyNumbers = (cards) =>
{
    if(!CONFIG.sets.wackyNumbers) { return; }
    
    const numCards = CONFIG.generation.numCardsWacky;
    const bounds = new Bounds(CONFIG.generation.minNum, CONFIG.generation.maxNum);
    
    const numbersPossible = bounds.asList();
    const allNumbers = [];
    while(allNumbers.length < numCards)
    {
        allNumbers.push(...numbersPossible);
    }
    shuffle(allNumbers);

    const typesPossible = Object.keys(SPECIAL_CARDS);
    const allTypes = [];
    while(allTypes.length < numCards)
    {
        allTypes.push(...typesPossible);
    }
    shuffle(allTypes);

    for(let i = 0; i < numCards; i++)
    {
        const randNum = allNumbers.pop();
        const numIcons = getNumIconsFromNumber(randNum);
        const type = allTypes.pop();
        cards.push(new Card(randNum, numIcons, type));
    }
}

const getNumIconsFromNumber = (num:number) =>
{
    const numIconsRaw = CONFIG.generation.numIconsPerNumber[num];
    const numIconsRandomness = CONFIG.generation.numIconsRandomness.random();
    return Math.max(Math.min( Math.round(numIconsRaw + numIconsRandomness), CONFIG.generation.numIconsMax), CONFIG.generation.numIconsMin);
}