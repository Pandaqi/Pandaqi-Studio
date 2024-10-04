import CONFIG from "../js_shared/config";
import { CardType, GeneralData, KALENDER_KAARTEN, PAKJE_CARDS, STOOM_CARDS, VAAR_CARDS } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        const sets = ["base", "prachtigePakjes", "pepernootPlekken"];
        for(const set of sets)
        {
            if(!CONFIG.sets[set]) { continue; }
            this.generateCardsForSet(set);
        }

        this.generateCalenderCards();

        console.log(this.cards);
    }

    generateCardsForSet(set:string = "base")
    {
        // @EXCEPTION: base set adds the steam engine pawn
        if(set == "base")
        {
            this.cards.push(new Card(CardType.PAWN, "stoomboot"));
        }

        // the different types of cards to be played
        const pakjeCards = this.filterSet(PAKJE_CARDS, set);
        this.createFromFrequencies(pakjeCards, CardType.PAKJE, CONFIG.generation.pakjes.defaultFrequency, set);

        const vaarCards = this.filterSet(VAAR_CARDS, set);
        this.createFromFrequencies(pakjeCards, CardType.VAREN, CONFIG.generation.varen.defaultFrequency, set);

        const stoomCards = this.filterSet(STOOM_CARDS, set);
        this.createFromFrequencies(pakjeCards, CardType.STOOMBOOT, CONFIG.generation.stoomboot.defaultFrequency, set);
    }

    filterSet(dict:Record<string,GeneralData>, setTarget:string)
    {
        const dictOut = {};
        for(const [key,data] of Object.entries(dict))
        {
            const setRaw = data.set ?? "base";
            const set = Array.isArray(setRaw) ? setRaw : [setRaw];
            if(!set.includes(setTarget)) { continue; }
            dictOut[key] = data;
        }
        return dictOut;
    }

    createFromFrequencies(dict:Record<string,GeneralData>, type:CardType, defFreq:number = 1, set = "base")
    {
        for(const [key,data] of Object.entries(dict))
        {
            const freq = data.freq ?? defFreq;
            for(let i = 0; i < freq; i++)
            {
                this.cards.push(new Card(type, key, set));
            }
        }
    }

    generateCalenderCards()
    {
        if(!CONFIG.sets.kalenderKaarten) { return; }
        this.createFromFrequencies(KALENDER_KAARTEN, CardType.KALENDER, CONFIG.generation.kalenderKaarten.defaultFrequency, "kalenderKaarten");
    }
}