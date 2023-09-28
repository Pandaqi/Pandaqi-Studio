import GridMapper from "js/pq_games/layout/gridMapper";
import CONFIG from "../js_shared/config";
import PandaqiWords from "js/pq_words/main";
import WordData from "js/pq_words/wordData";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import equidistantColorsBetweenOpposites from "./tools/equidistantColorsBetweenOpposites";
import createWavyRect from "./tools/createWavyRect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Slider from "../js_shared/slider";
import { ACTIONS, PROPERTIES, SLIDERS } from "../js_shared/dict";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";

export default class SliderCards
{
    sliders: Slider[];
    gridMapper: GridMapper;
    
    constructor() { }

    generate()
    {
        if(!CONFIG.generateSliders) { return; }

        this.setup();
        this.pickSliders();
    }

    setup()
    {
        const dims = CONFIG.sliderCards.dims[CONFIG.cardSize ?? "regular"];

        const gridConfig = { pdfBuilder: CONFIG.pdfBuilder, dims: dims, dimsElement: CONFIG.sliderCards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);
        this.gridMapper = gridMapper; 

        const cardSize = gridMapper.getMaxElementSize();
        CONFIG.sliderCards.size = cardSize.clone();
    }
    
    pickSliders()
    {
        let properties = Object.keys(PROPERTIES);
        shuffle(properties);

        const sliderDict = Object.assign({}, SLIDERS);
        const actionDict = Object.assign({}, ACTIONS);
        
        const numSliders = CONFIG.sliderCards.num;
        const slidersPerMainType = {};

        console.log(CONFIG);
        
        let sliders = [];
        for(let i = 0; i < numSliders; i++)
        {
            // pick main type
            let mainType = "property";
            if(CONFIG.expansions.crasheryCliffs) { mainType = getWeighted(sliderDict); }
            const data = SLIDERS[mainType];

            // pick subtype, if applicable
            const subType = (mainType == "property") ? properties.pop() : "";
            
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

    async draw()
    {
        const promises = [];
        for(const slider of this.sliders)
        {
            promises.push(slider.draw());
        }
        const canvases = await Promise.all(promises);
        this.gridMapper.addElements(canvases.flat());
        return this.gridMapper.getCanvases();
    }
}