import { shuffle } from "lib/pq-games";
import { CONFIG } from "./config";
import { CardData, SETS, Type } from "./dict";

export const createRandomSet = (type:Type) => 
{
    const numCards = CONFIG.generation.randomSetSizes[type];

    let masterDictionary = {};
    for(const [setName,setData] of Object.entries(SETS))
    {
        for(const [cardName, cardData] of Object.entries(setData))
        {
            if(cardData.type != type) { continue; }
            masterDictionary[cardName] = cardData;
        }
    }

    let keys = Object.keys(masterDictionary);
    shuffle(keys);

    const keysPicked = [];
    while(keysPicked.length < numCards)
    {
        const key = keys.pop();
        keysPicked.push(key);
    }

    // then assemble the final dictionary for those types
    const dict : Record<string,CardData> = {}; 
    for(const key of keysPicked)
    {
        dict[key] = masterDictionary[key];
    }
    return dict;
}