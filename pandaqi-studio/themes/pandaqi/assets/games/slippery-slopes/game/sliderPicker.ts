
import { shuffle, getWeighted, rangeInteger } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { ACTIONS, PROPERTIES, SLIDERS } from "../shared/dict";
import Slider from "../shared/slider";

export const sliderPicker = () : Slider[] =>
{
    if(!CONFIG._settings.generateSliders.value) { return []; }

    let properties = Object.keys(PROPERTIES);
    shuffle(properties);

    const sliderDict = Object.assign({}, SLIDERS);
    const actionDict = Object.assign({}, ACTIONS);
    
    let numSliders = CONFIG._drawing.sliderCards.num;
    const slidersPerMainType = {};

    // determine main types beforehand
    let mainTypes = [];
    let numPropertySliders = 0;
    for(let i = 0; i < numSliders; i++)
    {
        let mainType = "property";
        if(CONFIG._settings.expansions.crasheryCliffs.value) { mainType = getWeighted(sliderDict); }
        mainTypes.push(mainType);
        if(mainType == "property") { numPropertySliders++; }
    }

    // so we can determine exact sub types beforehand
    // (taking into account required types, min/max, etc.)
    let subTypes = [];
    const requiredSubTypes = getRequiredProperties(PROPERTIES);
    for(const type of requiredSubTypes)
    {
        subTypes.push(type);
    }
    while(subTypes.length < numPropertySliders)
    {
        subTypes.push(getWeighted(PROPERTIES));
    }

    if(CONFIG._debug.pickAllPossibleSliders)
    {
        const allProperties = Object.keys(PROPERTIES);
        numSliders = allProperties.length;
        subTypes = allProperties;
        mainTypes = new Array(numSliders).fill("property");
    }

    shuffle(mainTypes);
    shuffle(subTypes);
    
    const sliders = [];
    for(let i = 0; i < numSliders; i++)
    {
        // pick main type
        const mainType = mainTypes.pop();
        const data = SLIDERS[mainType];

        // pick subtype, if applicable
        const subType = (mainType == "property") ? subTypes.pop() : "";
        
        // determine actions
        let numActions = rangeInteger(CONFIG._drawing.sliderCards.numActionBounds);
        if(!CONFIG._settings.expansions.glidyGifts.value) { numActions = 0; }
        if(data.actionsForbidden) { numActions = 0; }

        const actions = getRandomActions(numActions, actionDict);

        // create the actual slider
        const newSlider = new Slider(mainType, subType, actions);
        sliders.push(newSlider);

        // some types have a max allowed; keep track of that
        if(!(mainType in slidersPerMainType)) { slidersPerMainType[mainType] = 0; }
        slidersPerMainType[mainType]++;

        const max = data.max ?? Infinity;
        if(slidersPerMainType[mainType] >= max)
        {
            delete sliderDict[mainType];
        }
    }

    return sliders;
}

const getRandomActions = (num:number, actionDict) =>
{
    const arr : string[] = [];
    for(let i = 0; i < num; i++)
    {
        arr.push(getWeighted(actionDict));
    }
    return arr;
}

const getRequiredProperties = (dict:Record<string,any>) =>
{
    const arr = [];
    for(const [key,val] of Object.entries(dict))
    {
        if(!val.req) { continue; }
        arr.push(key);
    }
    return arr;
}