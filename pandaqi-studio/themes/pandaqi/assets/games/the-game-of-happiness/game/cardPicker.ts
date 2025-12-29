import { CONFIG } from "../shared/config";
import { CARDS, Category, Pack } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    if(!CONFIG._settings.includeCards.value) { return []; }
    const cards = [];
    const packs = CONFIG._settings.packs.value;

    const cardsPerPack:Record<string,any[]> = {};
    for(const [category,list] of Object.entries(CARDS))
    {
        for(const cardData of list)
        {
            const pack = cardData.pack ?? Pack.BASE;
            if(!(pack in cardsPerPack)) { cardsPerPack[pack] = []; }
            cardsPerPack[pack].push(cardData);
            cardData.category = category as Category;
        }
    }

    let sum = 0;
    for(const [pack, list] of Object.entries(cardsPerPack))
    {
        console.log("#Cards in pack " + pack + ": " + list.length);
        //console.log(list);
        
        sum += list.length;
        const shouldInclude = packs.includes(pack);
        if(!shouldInclude) { continue; }

        for(const cardData of list)
        {
            const newCard = new Card(cardData.category, cardData.desc, pack);
            cards.push(newCard);
        }
    }

    console.log("Total #cards in entire game: " + sum);

    return cards;
}