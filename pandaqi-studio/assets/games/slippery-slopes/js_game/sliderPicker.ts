import GridMapper from "js/pq_games/layout/gridMapper";
import Point from "js/pq_games/tools/geometry/point";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { ACTIONS, PROPERTIES, SLIDERS } from "../js_shared/dict";
import Slider from "../js_shared/slider";

export default class SliderPicker
{
    sliders: Slider[];
    gridMapper: GridMapper;
    
    constructor() { }

    get() { return this.sliders.slice(); }
    generate()
    {
        this.sliders = [];
        this.pickSliders();
    }

    getRequiredProperties(dict:Record<string,any>)
    {
        const arr = [];
        for(const [key,val] of Object.entries(dict))
        {
            if(!val.req) { continue; }
            arr.push(key);
        }
        return arr;
    }
    
    pickSliders()
    {
        if(!CONFIG.generateSliders) { return; }

        let properties = Object.keys(PROPERTIES);
        shuffle(properties);

        const sliderDict = Object.assign({}, SLIDERS);
        const actionDict = Object.assign({}, ACTIONS);
        
        let numSliders = CONFIG.sliderCards.num;
        const slidersPerMainType = {};

        // determine main types beforehand
        let mainTypes = [];
        let numPropertySliders = 0;
        for(let i = 0; i < numSliders; i++)
        {
            let mainType = "property";
            if(CONFIG.expansions.crasheryCliffs) { mainType = getWeighted(sliderDict); }
            mainTypes.push(mainType);
            if(mainType == "property") { numPropertySliders++; }
        }

        // so we can determine exact sub types beforehand
        // (taking into account required types, min/max, etc.)
        let subTypes = [];
        const requiredSubTypes = this.getRequiredProperties(PROPERTIES);
        for(const type of requiredSubTypes)
        {
            subTypes.push(type);
        }
        while(subTypes.length < numPropertySliders)
        {
            subTypes.push(getWeighted(PROPERTIES));
        }

        if(CONFIG.debugAllPossibleProperties)
        {
            const allProperties = Object.keys(PROPERTIES);
            numSliders = allProperties.length;
            subTypes = allProperties;
            mainTypes = new Array(numSliders).fill("property");
        }

        shuffle(mainTypes);
        shuffle(subTypes);

        console.log(CONFIG);
        
        let sliders = [];
        for(let i = 0; i < numSliders; i++)
        {
            // pick main type
            const mainType = mainTypes.pop();
            const data = SLIDERS[mainType];

            // pick subtype, if applicable
            const subType = (mainType == "property") ? subTypes.pop() : "";
            
            // determine actions
            let numActions = rangeInteger(CONFIG.sliderCards.numActionBounds);
            if(!CONFIG.expansions.glidyGifts) { numActions = 0; }
            if(data.actionsForbidden) { numActions = 0; }

            const actions = this.getRandomActions(numActions, actionDict);

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

        this.sliders = sliders;
    }

    getRandomActions(num:number, actionDict)
    {
        const arr : string[] = [];
        for(let i = 0; i < num; i++)
        {
            arr.push(getWeighted(actionDict));
        }
        return arr;
    }
}