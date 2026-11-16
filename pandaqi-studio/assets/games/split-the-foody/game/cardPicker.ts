import { getSetting } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { SETS } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];

    if(getSetting("sets.base", CONFIG)) { generateSet(cards, "base"); }
    if(getSetting("sets.appetite", CONFIG)) { generateSet(cards, "appetite"); }
    if(getSetting("sets.coins", CONFIG)) { generateSet(cards, "coins"); }

    return cards;
}

const generateSet = (cards, key:string) =>
{
    const set = SETS[key];
    for(const [key,data] of Object.entries(set))
    {
        const freq = data.freq ?? 1;
        for(let i = 0; i < freq; i++)
        {
            const newCard = new Card(key, data);
            cards.push(newCard);
        }
    }
}