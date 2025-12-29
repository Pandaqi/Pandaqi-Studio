
import { CONFIG } from "../shared/config";
import { PACKS } from "../shared/dict";
import Pack from "./pack";
import Card from "./card";
import { shuffle, rangeInteger } from "lib/pq-games";

export const cardPicker = () : Card[] =>
{
    // ensure all packs have valid number
    const packsRaw = Object.assign({}, CONFIG._settings.packs);
    let packs : Record<string,any> = {};
    for(const [type,data] of Object.entries(packsRaw))
    {
        if(!data.value) { continue; }
        let num = parseInt(data.value.toString());
        if(isNaN(num)) { num = 1; }
        packs[type] = num;
    }

    // if set, just do something random with packs
    if(CONFIG._settings.randomizePacks.value)
    {
        const obj = {};
        const allTypes = shuffle(Object.keys(PACKS));
        const randNum = rangeInteger(3,6);
        for(let i = 0; i < randNum; i++)
        {
            obj[allTypes.pop()] = 1;
        }
        packs = obj;
    }

    // easy list for accessing all numbers for a pack
    const list = [];
    CONFIG.numberList = list;
    for(let i = CONFIG.numbers.min; i <= CONFIG.numbers.max; i++)
    {
        list.push(i);
    }

    // ensure we have the config data for how to draw packs
    for(const type of Object.values(PACKS))
    {
        if(!type.mainNumber) { type.mainNumber = {}; }
        if(!type.edgeNumber) { type.edgeNumber = {}; }
    }

    // get flat list of packs to create (incl quantities)
    const packTypes = [];
    for(const [type,numIncluded] of Object.entries(packs))
    {
        for(let i = 0; i < numIncluded; i++)
        {
            packTypes.push(type);
        }
    }

    // track stats so we can balance #hands and on which numbers they fall
    const handsPerNumber = {};
    for(const num of CONFIG.numberList)
    {
        handsPerNumber[num] = 0;
    }

    const cards : Card[] = []; 
    for(const type of packTypes)
    {
        cards.push(...new Pack(type).get());
    }
    return cards;
}