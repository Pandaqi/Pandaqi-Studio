import CONFIG from "../js_shared/config";
import { POWER_CARDS } from "../js_shared/dict";
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

        const baseNums = CONFIG.generation.baseNumbers;
        for(let i = baseNums.min; i <= baseNums.max; i++)
        {
            for(let a = 0; a < CONFIG.generation.baseCardsPerNumber; a++)
            {
                this.cards.push(new Card(i));
            }
        }
    }

    generateWildCards()
    {
        if(!CONFIG.sets.wildCards) { return; }

        for(let i = 0; i < CONFIG.generation.wildCardsNum; i++)
        {
            this.cards.push(new Card(-1, "", true));
        }
    }

    generatePowerCards()
    {
        if(!CONFIG.sets.powerCards) { return; }

        for(const [key,data] of Object.entries(POWER_CARDS))
        {
            const freq = data.freq ?? CONFIG.generation.powerCardFreqDefault;
            for(let i = 0; i < freq; i++)
            {
                this.cards.push(new Card(-1, key));
            }
        }

        const extraNums = CONFIG.generation.powerNumbers;
        for(let i = extraNums.min; i <= extraNums.max; i++)
        {
            for(let a = 0; a < CONFIG.generation.powerCardsPerNumber; a++)
            {
                this.cards.push(new Card(i));
            }
        }
    }
}