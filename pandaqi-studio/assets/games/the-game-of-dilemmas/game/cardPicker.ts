import { CONFIG } from "../shared/config";
import { CARDS, Category } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{    
    if(!CONFIG._settings.includeCards.value) { return []; }

    const cards = [];
    const packs = CONFIG._settings.packs.value;

    // create all cards to include (by ignoring those in a non-matching pack)
    const cardsPerPack:Record<string, Record<string, any[]>> = {};
    for(const [category,list] of Object.entries(CARDS))
    {
        for(const [pack,cardList] of Object.entries(list))
        {
            if(!(pack in cardsPerPack)) { cardsPerPack[pack] = {}; }
            if(!(category in cardsPerPack[pack])) { cardsPerPack[pack][category] = []; }
            cardsPerPack[pack][category].push(cardList);

            const shouldInclude = packs.includes(pack);
            if(!shouldInclude) { continue; }    

            for(const cardData of cardList)
            {
                const newCard = new Card(category as Category, pack, cardData);
                cards.push(newCard);
            }
        }
    }

    // this merely gives me statistics to use while developing
    let sumTotal = 0;
    for(const [pack, list] of Object.entries(cardsPerPack))
    {
        let sumPerType : Record<string, number> = {};
        for(const [category, subList] of Object.entries(list))
        {
            sumPerType[category] = subList.flat().length;
        }

        let sumPerPack = 0;
        for(const [type, freq] of Object.entries(sumPerType))
        {
            sumPerPack += freq;
        }

        console.log("#Cards in pack " + pack + ": " + sumPerPack);
        console.log("Cards per Type: ", sumPerType);
        console.log(list); 

        sumTotal += sumPerPack;
    }

    console.log("Total #cards in entire game: " + sumTotal);
    return cards;
}