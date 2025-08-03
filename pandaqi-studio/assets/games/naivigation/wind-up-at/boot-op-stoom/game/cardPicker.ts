import { CONFIG } from "../shared/config";
import { CardType, GeneralData, KALENDER_KAARTEN, PAKJE_CARDS, STOOM_CARDS, VAAR_CARDS } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    
    const sets = ["base", "prachtigePakjes", "pepernootPlekken"];
    for(const set of sets)
    {
        if(!CONFIG.sets[set]) { continue; }
        generateCardsForSet(cards, set);
    }

    generateCalenderCards(cards);

    return cards;
}

const generateCardsForSet = (cards:Card[], set:string = "base") =>
{
    // @EXCEPTION: base set adds the steam engine pawn
    if(set == "base")
    {
        cards.push(new Card(CardType.PAWN, "stoomboot"));
    }

    // the different types of cards to be played
    const pakjeCards = filterSet(PAKJE_CARDS, set);
    createFromFrequencies(cards, pakjeCards, CardType.PAKJE, CONFIG.generation.pakjes.defaultFrequency, set);

    const vaarCards = filterSet(VAAR_CARDS, set);
    createFromFrequencies(cards, vaarCards, CardType.VAREN, CONFIG.generation.varen.defaultFrequency, set);

    const stoomCards = filterSet(STOOM_CARDS, set);
    createFromFrequencies(cards, stoomCards, CardType.STOOMBOOT, CONFIG.generation.stoomboot.defaultFrequency, set);
}

const filterSet = (dict:Record<string,GeneralData>, setTarget:string) =>
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

const createFromFrequencies = (cards:Card[], dict:Record<string,GeneralData>, type:CardType, defFreq:number = 1, set = "base") =>
{
    const arr = [];
    let flip = false;
    for(const [key,data] of Object.entries(dict))
    {
        let freq = data.freq ?? defFreq;
        if(type == CardType.PAKJE && set != "base") { freq /= 2; } // @NOTE: nasty exception, but this was the simplest way to lower frequencies of basegame cards when added to expansion too
        for(let i = 0; i < freq; i++)
        {
            const newCard = new Card(type, key, set);
            newCard.isFlipped = flip;
            cards.push(newCard);
            flip = !flip;
            arr.push(newCard);
        }
    }
    return arr;
}

const generateCalenderCards = (cards:Card[]) =>
{
    if(!CONFIG.sets.krappeKalender) { return; }
    createFromFrequencies(cards, KALENDER_KAARTEN, CardType.KALENDER, CONFIG.generation.kalenderKaarten.defaultFrequency, "kalenderKaarten");
}