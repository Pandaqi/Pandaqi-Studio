import CONFIG from "./config";
import { CardData, SETS } from "./dict";
import shuffle from "js/pq_games/tools/random/shuffle";

export default (sizes = CONFIG.generation.randomSetSizes) => 
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
    let maxTotal = 0;
    for(const [key,freq] of Object.entries(sizes))
    {
        numPerType[key] = 0;
        maxTotal += freq;
    }

    const keysPicked = [];
    while(keysPicked.length < maxTotal)
    {
        const key = keys.pop();
        const data = masterDictionary[key];
        const subType = data.type;
        if(numPerType[subType] >= sizes[subType]) { continue; }

        keysPicked.push(key);
        numPerType[subType]++;
    }

    // then assemble the final dictionary for those types
    const dict : Record<string,CardData> = {}; 
    for(const key of keysPicked)
    {
        dict[key] = masterDictionary[key];
    }
    return dict;
}