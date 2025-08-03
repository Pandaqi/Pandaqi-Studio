import { CONFIG } from "../shared/config";
import { SPECIAL_BIDS, SUITS, Suit } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];

    generateBaseCards(cards);
    generateWildCards(cards);
    generatePowerCards(cards);

    return cards;
}

const generateBaseCards = (cards) =>
{
    if(!CONFIG.sets.base) { return; }

    const numBounds = CONFIG.generation.baseCardsPerSuit;
    const numCopies = CONFIG.generation.baseCopiesPerSuit;
    for(const suit of Object.keys(SUITS))
    {
        for(let a = 0; a < numCopies; a++)
        {
            for(let i = numBounds.min; i <= numBounds.max; i++)
            {
                cards.push(new Card(i, suit as Suit));
            }
        }
    }
}

const generateWildCards = (cards) =>
{
    if(!CONFIG.sets.wildCards) { return; }

    for(let i = 0; i < CONFIG.generation.wildCardsNum; i++)
    {
        cards.push(new Card());
    }
}

const generatePowerCards = (cards) =>
{
    if(!CONFIG.sets.powerCards) { return; }

    for(const [key,data] of Object.entries(SPECIAL_BIDS))
    {
        cards.push(new Card(undefined, undefined, key));
    }
}