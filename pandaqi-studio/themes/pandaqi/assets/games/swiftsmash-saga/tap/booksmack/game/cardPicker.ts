import { CONFIG } from "../shared/config";
import { SYMBOLS } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    
    // collect all symbols we want to print (in a neat uniform array)
    const allSymbols : string[] = [];
    for(const [set,entry] of Object.entries(CONFIG.generation.symbolsPerSet))
    {
        if(!CONFIG._settings.sets[set].value) { continue; }
        const data = typeof entry === "string" ? entry.split("") : entry;
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
            cards.push( new Card(symbol) );
        }
    }

    return cards;
}