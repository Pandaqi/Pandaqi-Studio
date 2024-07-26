import CONFIG from "../js_shared/config";
import { EXPANSION } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        // base game cards
        for(let i = CONFIG.generation.minNumber; i <= CONFIG.generation.maxNumber; i++)
        {
            for(let a = 0; a < CONFIG.generation.numCardsPerNumber; a++)
            {
                this.cards.push(new Card(i));
            }
        }

        // expansion cards
        for(const [key,data] of Object.entries(EXPANSION))
        {
            this.cards.push(new Card(data.num, key));
        }

        console.log(this.cards);
    }
}