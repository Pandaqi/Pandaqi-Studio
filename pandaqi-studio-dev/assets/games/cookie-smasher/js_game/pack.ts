import CONFIG from "../js_shared/config";
import Card from "./card";

export default class Pack
{
    food: string;
    cards: Card[];

    constructor(f:string)
    {
        this.food = f;
        this.cards = [];
    }

    getData()
    {
        return CONFIG.possibleCards[this.food];
    }

    fill()
    {
        const freqMult = this.getData().freq ?? 1.0;
        const num = Math.round(freqMult * CONFIG.generation.defaultCardFrequency);
        const cards = [];
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(this.food, CONFIG.possibleCards[this.food]);
            newCard.fill();
            cards.push(newCard);
        }
        this.cards = cards;
    }

    async draw()
    {
        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.draw());
        }
        return await Promise.all(promises);
    }
}