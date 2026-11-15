
import { getSetting, shuffle, Bounds, getWeighted } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { POWER_CARDS } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[]  =>
{
    const cards = [];

    generateBaseCards(cards);
    generateWildCards(cards);
    generatePowerCards(cards);

    return cards;
}

const generateBaseCards = (cards) =>
{
    if(!getSetting("sets.base", CONFIG)) { return; }

    const baseNums = CONFIG.generation.baseNumbers;
    for(let i = baseNums.min; i <= baseNums.max; i++)
    {
        for(let a = 0; a < CONFIG.generation.baseCardsPerNumber; a++)
        {
            cards.push(new Card(i));
        }
    }
}

const generateWildCards = (cards) =>
{
    if(!getSetting("sets.wildCards", CONFIG)) { return; }

    for(let i = 0; i < CONFIG.generation.wildCardsNum; i++)
    {
        cards.push(new Card(-1, "", true));
    }
}

const generatePowerCards = (cards) =>
{
    if(!getSetting("sets.powerCards", CONFIG)) { return; }

    const keysRand = shuffle(Object.keys(POWER_CARDS));
    keysRand.splice(keysRand.indexOf("add_number"), 1);
    keysRand.unshift("add_number"); // this one is required, so always add as first

    let numSpecialCardsAdded = 0;
    for(const key of keysRand)
    {
        const data = POWER_CARDS[key];
        const freq = data.freq ?? CONFIG.generation.powerCardFreqDefault;
        for(let i = 0; i < freq; i++)
        {
            const randNum = new Bounds(1,6).randomInteger();
            cards.push(new Card(randNum, key));
        }
        
        numSpecialCardsAdded += freq;
        if(numSpecialCardsAdded >= CONFIG.generation.maxPowerCards)
        {
            break;
        }
    }

    const extraNums = CONFIG.generation.powerNumbers;
    for(let i = extraNums.min; i <= extraNums.max; i++)
    {
        for(let a = 0; a < CONFIG.generation.powerCardsPerNumber; a++)
        {
            const actionKey = a <= (0.5*CONFIG.generation.powerCardsPerNumber) ? getWeighted(POWER_CARDS) : "";
            cards.push(new Card(i, actionKey));
        }
    }
}