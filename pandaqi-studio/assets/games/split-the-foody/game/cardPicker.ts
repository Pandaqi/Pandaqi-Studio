import CONFIG from "../shared/config";
import { SETS } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }

    generate()
    {
        this.cards = [];

        if(CONFIG._settings.sets.base.value) { this.generateSet("base"); }
        if(CONFIG._settings.sets.appetite.value) { this.generateSet("appetite"); }
        if(CONFIG._settings.sets.coins.value) { this.generateSet("coins"); }
    }

    generateSet(key:string)
    {
        const set = SETS[key];
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