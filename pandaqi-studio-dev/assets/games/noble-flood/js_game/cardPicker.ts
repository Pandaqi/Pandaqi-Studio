import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CONTRACTS, CardType, DYNAMIC_OPTIONS, NUMBERS, SPECIAL_CARDS, SUITS } from "../js_shared/dict";
import Card from "./card";
import toTextDrawerImageStrings from "js/pq_games/tools/text/toTextDrawerImageStrings";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];

        // prepare the actual suits/numbers/icons we'll include (and reuse in action texts)
        const suitsIncluded = Object.keys(SUITS).slice(0, CONFIG.generation.numSuits);
        DYNAMIC_OPTIONS["%suit%"] = suitsIncluded;
        DYNAMIC_OPTIONS["%number%"] = NUMBERS.slice(0, CONFIG.generation.numbersUsedPerSuit);

        const suitInfoDict = {};
        for(const suit of suitsIncluded) { suitInfoDict[suit] = SUITS[suit]; }
        DYNAMIC_OPTIONS["%suitImageStrings%"] = toTextDrawerImageStrings(suitInfoDict, "suits");

        // create all the actual cards
        this.generatePlayingCards();
        this.generateBaseContracts();
        this.generateFullFlood();
        this.generateStraightShakeContracts();

        console.log(this.cards);
    }

    generatePlayingCards()
    {
        if(!CONFIG.generatePlayingCards) { return; }

        const suitsUsed = DYNAMIC_OPTIONS["%suit%"].slice();
        const numbersUsed = DYNAMIC_OPTIONS["%number%"].slice();

        for(const suit of suitsUsed)
        {
            for(const number of numbersUsed)
            {
                const card = new Card(CardType.CARD);
                card.setSuitAndNumber(suit, number);
                this.cards.push(card);
            }
        }
    }

    generateBaseContracts()
    {
        if(!CONFIG.sets.base) { return; }
        this.generateContracts("base");
    }
    
    generateStraightShakeContracts()
    {
        if(!CONFIG.sets.straightShake) { return; }
        this.generateContracts("straightShake");
    }

    generateContracts(targetSet:string)
    {
        const defFreq = CONFIG.generation.defaultFrequencyContracts[targetSet] ?? 1;
        for(const [key,data] of Object.entries(CONTRACTS))
        {
            const set = data.set ?? "base";
            if(set != targetSet) { continue; }

            const freq = data.freq ?? defFreq;
            for(let i = 0; i < freq; i++)
            {
                const card = new Card(CardType.CONTRACT);
                const dynDetails = this.fillInDynamically(data.desc);
                card.setContract(key, dynDetails);
                this.cards.push(card);
            }
        }
    }

    generateFullFlood()
    {
        if(!CONFIG.sets.fullFlood) { return; }

        const defFreq = CONFIG.generation.defaultFrequencySpecialCards ?? 1;
        for(const [key,data] of Object.entries(SPECIAL_CARDS))
        {
            const freq = data.freq ?? defFreq;
            for(let i = 0; i < freq; i++)
            {
                const card = new Card(CardType.SPECIAL);
                card.setSpecial(key);
                this.cards.push(card);
            }
        }
    }

    fillInDynamically(s:string)
    {
        const options = structuredClone(DYNAMIC_OPTIONS);
        const needles = Object.keys(options);
        let foundSomething = true;
        const dynamicDetails = [];
        while(foundSomething)
        {
            foundSomething = false;
            for(const needle of needles)
            {
                if(!s.includes(needle)) { continue; }

                const randOption = shuffle(options[needle]).pop();
                s = s.replace(needle, randOption);
                dynamicDetails.push(randOption);
                foundSomething = true;
                break;
            }
        }
        return dynamicDetails;
    }

}