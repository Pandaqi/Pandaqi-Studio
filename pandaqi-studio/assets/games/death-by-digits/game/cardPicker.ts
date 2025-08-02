import equidistantColors from "js/pq_games/layout/color/equidistantColors";
import { CONFIG } from "../shared/config";
import { EXPANSION } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    
    // base game cards
    const uniqueNums = CONFIG.generation.maxNumber - CONFIG.generation.minNumber + 1;
    const colors = equidistantColors(uniqueNums, 87, 87);
    for(let i = 0; i < uniqueNums; i++)
    {
        const num = CONFIG.generation.minNumber + i;
        for(let a = 0; a < CONFIG.generation.numCardsPerNumber; a++)
        {
            cards.push(new Card(num, "", colors[i]));
        }
    }

    // expansion cards
    for(const [key,data] of Object.entries(EXPANSION))
    {
        cards.push(new Card(data.num, key));
    }

    return cards;
}