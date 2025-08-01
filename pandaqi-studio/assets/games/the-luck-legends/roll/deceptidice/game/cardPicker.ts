import { CONFIG } from "../shared/config";
import { SPECIAL_BIDS, SUITS, Suit } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateBaseCards();
        this.generateWildCards();
        this.generatePowerCards();

        console.log(this.cards);
    }

    generateBaseCards()
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
                    this.cards.push(new Card(i, suit as Suit));
                }
            }
        }
    }

    generateWildCards()
    {
        if(!CONFIG.sets.wildCards) { return; }

        for(let i = 0; i < CONFIG.generation.wildCardsNum; i++)
        {
            this.cards.push(new Card());
        }
    }

    generatePowerCards()
    {
        if(!CONFIG.sets.powerCards) { return; }

        for(const [key,data] of Object.entries(SPECIAL_BIDS))
        {
            this.cards.push(new Card(undefined, undefined, key));
        }
    }
}