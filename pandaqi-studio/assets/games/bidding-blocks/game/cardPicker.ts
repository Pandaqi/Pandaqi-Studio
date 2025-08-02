import { CONFIG } from "../shared/config";
import { Suit } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    const numbers = CONFIG.generation.numberBounds.asList();
    const suits = Object.values(Suit);
    for(const suit of suits)
    {
        for(const num of numbers)
        {
            cards.push(new Card(suit as Suit, num));
        }
    }
    return cards;
}