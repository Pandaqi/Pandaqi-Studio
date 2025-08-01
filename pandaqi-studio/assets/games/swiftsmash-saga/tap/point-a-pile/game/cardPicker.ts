import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { CardType, ColorType, MATERIAL } from "../shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        // create all cards for included sets, reading from the specific material for it
        for(const [cardType,data] of Object.entries(MATERIAL))
        {
            const setName = CONFIG.generation.setNameForCardType[cardType];
            if(!CONFIG.sets[setName]) { continue; }

            const num = CONFIG.generation.numCardsPerSet[setName] ?? 25;
            for(let i = 0; i < num; i++)
            {
                const action = getWeighted(data);
                const newCard = new Card(cardType as CardType);
                newCard.setAction(action);
                this.cards.push(newCard);
            }
        }

        // assign colors randomly to all, but distributed in a controlled way
        const numCards = this.cards.length;
        const colors : ColorType[] = [];
        const colorDistribution : Record<string,number> = CONFIG.generation.colorDist;
        for(const [color,freqRaw] of Object.entries(colorDistribution))
        {
            const freq = Math.ceil(freqRaw * numCards);
            for(let i = 0; i < freq; i++)
            {
                colors.push(color as ColorType);
            }
        }
        shuffle(colors);

        for(const card of this.cards)
        {
            card.setColor(colors.pop());
        }

        console.log(this.cards);
    }
}