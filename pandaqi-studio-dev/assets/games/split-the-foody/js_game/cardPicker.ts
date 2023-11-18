import CONFIG from "../js_shared/config";
import { SETS } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }

    generate()
    {
        this.cards = [];

        const set = SETS[CONFIG.cardSet];
        for(const [key,data] of Object.entries(set))
        {
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(key, data);
                this.cards.push(newCard);
            }
        }
    }

}