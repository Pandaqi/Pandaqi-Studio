import Bounds from "js/pq_games/tools/numbers/bounds";
import CONFIG from "../js_shared/config";
import { POWER_CARDS } from "../js_shared/dict";
import Card from "./card";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        this.generateBaseCards();
        this.generateWildCards();
        this.generatePowerCards();

        console.log(this.cards);
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        const baseNums = CONFIG.generation.baseNumbers;
        for(let i = baseNums.min; i <= baseNums.max; i++)
        {
            for(let a = 0; a < CONFIG.generation.baseCardsPerNumber; a++)
            {
                this.cards.push(new Card(i));
            }
        }
    }

    generateWildCards()
    {
        if(!CONFIG.sets.wildCards) { return; }

        for(let i = 0; i < CONFIG.generation.wildCardsNum; i++)
        {
            this.cards.push(new Card(-1, "", true));
        }
    }

    generatePowerCards()
    {
        if(!CONFIG.sets.powerCards) { return; }

        const keysRand = shuffle(Object.keys(POWER_CARDS));
        keysRand.splice(keysRand.indexOf("add_number"), 1);
        keysRand.unshift("add_number"); // this one is required, so always add as first

        let numSpecialCardsAdded = 0;
        for(const key of keysRand)
        {
            const data = POWER_CARDS[key];
            const freq = data.freq ?? CONFIG.generation.powerCardFreqDefault;
            for(let i = 0; i < freq; i++)
            {
                const randNum = new Bounds(1,6).randomInteger();
                this.cards.push(new Card(randNum, key));
            }
            
            numSpecialCardsAdded += freq;
            if(numSpecialCardsAdded >= CONFIG.generation.maxPowerCards)
            {
                break;
            }
        }

        const extraNums = CONFIG.generation.powerNumbers;
        for(let i = extraNums.min; i <= extraNums.max; i++)
        {
            for(let a = 0; a < CONFIG.generation.powerCardsPerNumber; a++)
            {
                const actionKey = a <= (0.5*CONFIG.generation.powerCardsPerNumber) ? getWeighted(POWER_CARDS) : "";
                this.cards.push(new Card(i, actionKey));
            }
        }
    }
}