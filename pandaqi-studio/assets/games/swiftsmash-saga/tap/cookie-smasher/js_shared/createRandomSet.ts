import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "./config";
import { CardData, SETS } from "./dict";
import shuffle from "js/pq_games/tools/random/shuffle";

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

    // first try to find some ideal set
    let numbersUsed = [];
    const maxPossibleNumbers = 9;

    let numPerType = {};
    const maxPerType = 2;

    let safeFoodUsed = 0;
    const safeFoodMax = 2;

    const keysPicked = [];
    while(keysPicked.length < size)
    {
        const key = keys.pop();
        const data = masterDictionary[key];
        if(data.safe && safeFoodUsed >= safeFoodMax) { continue; }
        if(numPerType[data.type] >= maxPerType) { continue; }

        let num = data.num;
        if(num != 0 && numbersUsed.length < maxPossibleNumbers && numbersUsed.includes(num)) { continue; }

        const dependencies = data.dependsOn ?? [];
        let ignore = false;
        for(const dependency of dependencies)
        {
            if(dependency == "safe")
            {
                if(safeFoodUsed <= 0) { ignore = true; break; }
                continue; 
            }

            // @NOTE: if we reached here, we must be sure the dependency is a FOOD type
            if(!keysPicked.includes(dependency))
            {
                keysPicked.push(dependency);
            }
        }

        if(ignore) { continue; }

        keysPicked.push(key);
        numPerType[data.type]++;
        numbersUsed.push(num);
        if(data.safe) { safeFoodUsed++; }
    }

    // but have a fallback with random choices if that doesn't work out
    keys = Object.keys(masterDictionary);
    shuffle(keys);
    while(keysPicked.length < size)
    {
        const key = keysPicked.pop();
        if(keysPicked.includes(key)) { continue; }
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