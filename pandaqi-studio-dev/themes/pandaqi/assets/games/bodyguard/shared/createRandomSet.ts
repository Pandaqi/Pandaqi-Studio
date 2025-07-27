import CONFIG from "./config";
import { CardData, SETS } from "./dict";
import shuffle from "lib/pq-games/tools/random/shuffle";

export default (size = CONFIG.generation.randomSetSize) => 
{
    let masterDictionary = {};
    for(const [setName,setData] of Object.entries(SETS))
    {
        for(const [cardName, cardData] of Object.entries(setData))
        {
            masterDictionary[cardName] = cardData;
        }
    }

    let keys = Object.keys(masterDictionary);
    shuffle(keys);

    let numPerType = {};
    const maxPerType = 3;

    const keysPicked = [];
    while(keysPicked.length < size)
    {
        const key = keys.pop();
        const data = masterDictionary[key];
        if(numPerType[data.type] >= maxPerType) { continue; }

        keysPicked.push(key);
        numPerType[data.type]++;
    }

    // then assemble the final dictionary for those types
    const dict : Record<string,CardData> = {}; 
    for(const key of keysPicked)
    {
        dict[key] = masterDictionary[key];
    }
    return dict;
}