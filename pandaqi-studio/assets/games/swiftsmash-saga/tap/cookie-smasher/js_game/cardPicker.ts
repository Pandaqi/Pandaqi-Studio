import CONFIG from "../js_shared/config";
import createRandomSet from "../js_shared/createRandomSet";
import { SETS } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        // automatically remember the texture needed + save overall generation results on CONFIG
        // @TODO: this is terrible practice, but that's what I chose to do for this old game ...
        for(const [setName,setData] of Object.entries(SETS))
        {
            for(const [cardName, cardData] of Object.entries(setData))
            {
                cardData.textureKey = setName;
            }
        }

        // determine cards wanted
        let dict = SETS[CONFIG.cardSet];
        if(CONFIG.cardSet == "random") { dict = createRandomSet(); }

        // actually create them
        CONFIG.possibleTypes = [];
        CONFIG.possibleCards = [];
        CONFIG.possibleNumbers = [];
        for(const [key,data] of Object.entries(dict))
        {
            if(!CONFIG.possibleCards.includes(key)) { CONFIG.possibleCards.push(key); }
            if(!CONFIG.possibleTypes.includes(data.type)) { CONFIG.possibleTypes.push(data.type); }
            if(!CONFIG.possibleNumbers.includes(data.num)) { CONFIG.possibleNumbers.push(data.num); }
        }

        for(const [key,data] of Object.entries(dict))
        {
            const freqMult = data.freq ?? 1.0;
            const num = Math.round(freqMult * CONFIG.generation.defaultCardFrequency);
            for(let i = 0; i < num; i++)
            {
                const newCard = new Card(key, data);
                newCard.fill(CONFIG.possibleTypes, CONFIG.possibleNumbers);
                this.cards.push(newCard);
            }
        }

        console.log(this.cards);
    }
}