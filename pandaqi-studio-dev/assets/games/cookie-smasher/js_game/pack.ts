import CONFIG from "../js_shared/config";
import Card from "./card";

export default class Pack
{
    type: string;
    cards: Card[];

    constructor(tp:string)
    {
        this.type = tp;
        this.cards = [];
    }

    getData()
    {
        return CONFIG.possibleCards[this.type];
    }

    fill()
    {
        const freqMult = this.getData().freq ?? 1.0;
        const num = Math.round(freqMult * CONFIG.generation.defaultCardFrequency);
        const cards = [];
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(this.type);
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