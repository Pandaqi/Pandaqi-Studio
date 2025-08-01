import { CONFIG } from "../shared/config";
import { FOOD, MaterialType } from "../shared/dict";
import Card from "./card";

export default class TokenPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        if(!CONFIG.sets.foodTokens) { return; }

        for(const [key,data] of Object.entries(FOOD))
        {
            const defFreq = CONFIG.generation.defaultFoodFrequenciesPerTier[data.tier ?? 0];
            const freq = data.freq ?? defFreq;
            for(let i = 0; i < freq; i++)
            {
                this.cards.push(new Card(MaterialType.FOOD, key));
            }
        }

        // the "beast state" token which some players might find useful
        this.cards.push(new Card(MaterialType.FOOD, "beastState"));
        
        console.log(this.cards);
    }
}