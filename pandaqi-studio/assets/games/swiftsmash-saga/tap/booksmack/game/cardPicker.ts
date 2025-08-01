import { CONFIG } from "../shared/config";
import { SYMBOLS } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        // collect all symbols we want to print (in a neat uniform array)
        const allSymbols : string[] = [];
        for(let [set,data] of Object.entries(CONFIG.generation.symbolsPerSet))
        {
            if(!CONFIG.sets[set]) { continue; }
            if(typeof data === "string") { data = data.split(""); }
            const dataFinal = (data as any[]).map((x) => x.toString());
            allSymbols.push(...dataFinal);
        }

        // then simply create them all
        for(const symbol of allSymbols)
        {
            const data = SYMBOLS[symbol] ?? {};
            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                this.cards.push( new Card(symbol) );
            }
        }

        console.log(this.cards);
    }
}