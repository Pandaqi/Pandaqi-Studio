import { CONFIG } from "../shared/config";
import { Suit } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        const numbers = CONFIG.generation.numberBounds.asList();
        const suits = Object.values(Suit);
        for(const suit of suits)
        {
            for(const num of numbers)
            {
                this.cards.push(new Card(suit as Suit, num));
            }
        }

        console.log(this.cards);
    }
}