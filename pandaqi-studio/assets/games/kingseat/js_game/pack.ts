import Card from "./card"
import { PACKS } from "./dict"
import CONFIG from "./config"

export default class Pack 
{
    type: string;
    cards: Card[];
    
    constructor(type:string)
    {
        this.type = type;
        this.setupCards();
    }

    setupCards()
    {
        const data = PACKS[this.type];
        const cards = [];
        this.cards = cards;

        const totalNum = CONFIG.cards.numPerPack;
        const perc = Math.min(CONFIG.cards.percentageWithAction, data.action.percentage);
        const numWithAction = Math.round(perc * totalNum);
        for(let i = 0; i < totalNum; i++)
        {
            let dark = 0;
            let numDarkCardsForType = data.dark ? data.dark.length : 0;
            numDarkCardsForType = Math.min(numDarkCardsForType, CONFIG.cards.maxDarkCardsPerPack);
            if(i < numDarkCardsForType) { dark = i+1; }

            let action = i <= numWithAction;

            const cardParams = {
                type: this.type,
                dark: dark,
                action: action
            }

            const c = new Card(cardParams);
            cards.push(c);
        }
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