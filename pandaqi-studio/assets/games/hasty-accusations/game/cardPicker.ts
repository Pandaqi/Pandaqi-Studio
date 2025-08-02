import getWeighted from "js/pq_games/tools/random/getWeighted";
import { CONFIG } from "../shared/config";
import { ActionData, SETS, SUSPECTS, Type } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    if(!CONFIG._settings.includeCards.value) { return; }

    const set = structuredClone(SETS[CONFIG._settings.cardSet.value]);
    const deckSize = CONFIG.generation.numPlayingCardsInDeck;
    const defFreqBounds = CONFIG.generation.defFreqBounds;
    const freqs = {};

    const murderCards:Record<string,ActionData> = {};
    const protectCards:Record<string,ActionData> = {};
    for(const [key,data] of Object.entries(set))
    {
        if(data.murderQuotient) { murderCards[key] = data; }
        if(data.protectQuotient) { protectCards[key] = data; }
    }

    let murderQuotient = 0;
    const murderQuotientTarget = CONFIG.generation.murderQuotientTarget.clone().scale(deckSize);

    let protectQuotient = 0;
    const protectQuotientTarget = CONFIG.generation.protectQuotientTarget.clone().scale(deckSize);

    const registerCard = (key:string) =>
    {
        const data = set[key];

        const nextMurderQuotient = murderQuotient + (data.murderQuotient ?? 0);
        const nextProtectQuotient = protectQuotient + (data.protectQuotient ?? 0);

        if(data.murderQuotient && nextMurderQuotient > murderQuotientTarget.max) { delete set[key]; return; }
        if(data.protectQuotient && nextProtectQuotient > protectQuotientTarget.max) { delete set[key]; return; } 
        
        murderQuotient = nextMurderQuotient;
        protectQuotient = nextProtectQuotient;

        const card = new Card(Type.ACTION, key);
        cards.push(card);

        if(!(key in freqs)) { freqs[key] = 0; }
        freqs[key]++;

        const max = (set[key].freq ?? defFreqBounds).max;
        if(freqs[key] >= max) { delete set[key]; }
    }

    // first add each card a defined MINIMUM number of times
    for(const [key, data] of Object.entries(set))
    {
        const min = (data.freq ?? defFreqBounds).min;
        for(let i = 0; i < min; i++)
        {
            registerCard(key);
        }
    }

    // then fill the important quotients until they meet their target
    while(murderQuotient < murderQuotientTarget.min)
    {
        registerCard( getWeighted(murderCards, "murderQuotient") );
    }

    while(protectQuotient < protectQuotientTarget.max)
    {
        if(Object.keys(protectCards).length <= 0) { break; }
        const key = getWeighted(protectCards, "protectQuotient");
        if(!(key in set)) { delete protectCards[key]; continue; }
        registerCard(key);
    }

    // then just fill up whatever space is left
    while(cards.length < deckSize)
    {
        registerCard( getWeighted(set) );
    }
    
    console.log(freqs);
    return cards;
}