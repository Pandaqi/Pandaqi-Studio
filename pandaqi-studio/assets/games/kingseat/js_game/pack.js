import Card from "./card"
import { PACKS } from "./dictionary"

export default class Pack {
    constructor(type, config)
    {
        this.type = type;
        this.config = config;
        this.setupCards();
        this.draw();
    }

    setupCards()
    {
        const data = PACKS[this.type];
        const cards = [];
        this.cards = cards;

        const totalNum = this.config.cards.numPerPack;
        const perc = Math.min(this.config.cards.percentageWithAction, data.action.percentage);
        const numWithAction = Math.round(perc * totalNum);
        for(let i = 0; i < totalNum; i++)
        {
            let dark = 0;
            let numDarkCardsForType = data.dark ? data.dark.length : 0;
            numDarkCardsForType = Math.min(numDarkCardsForType, this.config.cards.maxDarkCardsPerPack);
            if(i < numDarkCardsForType) { dark = i+1; }

            let action = i <= numWithAction;

            const cardParams = {
                type: this.type,
                dark: dark,
                action: action
            }

            const c = new Card(cardParams, this.config);
            cards.push(c);
        }
    }

    draw()
    {
        for(const card of this.cards)
        {
            card.draw();
            this.config.gridMapper.addElement(card.getCanvas());
        }
    }
}