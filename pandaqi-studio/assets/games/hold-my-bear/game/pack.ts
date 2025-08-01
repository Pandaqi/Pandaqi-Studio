import { CONFIG } from "../shared/config";
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

    fill()
    {
        const dist = CONFIG.generation.numberDistribution;
        const cards = [];
        for(let i = 0; i < dist.length; i++)
        {
            const howMany = dist[i];
            for(let a = 0; a < howMany; a++)
            {
                const num = (i+1);
                const newCard = new Card(this.type, num);
                cards.push(newCard);
            }
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