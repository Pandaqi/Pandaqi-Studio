import getWeighted from "js/pq_games/tools/random/getWeighted";
import CONFIG from "../js_shared/config";
import { ActionData, SETS, SUSPECTS, Type } from "../js_shared/dict";
import Card from "./card";

export default class CardPicker
{
    cardsPlay: Card[]
    cardsSuspect: Card[]

    constructor() {}
    getPlay() { return this.cardsPlay; }
    getSuspect() { return this.cardsSuspect; }

    generate()
    {
        this.generatePlayingCards();
        this.generateSuspectCards();
    }

    generatePlayingCards()
    {
        this.cardsPlay = [];
        if(!CONFIG.includeCards) { return; }

        const set = structuredClone(SETS[CONFIG.cardSet]);
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
            this.cardsPlay.push(card);

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
        while(this.cardsPlay.length < deckSize)
        {
            registerCard( getWeighted(set) );
        }
        
        console.log(freqs);
    }

    generateSuspectCards()
    {
        this.cardsSuspect = [];
        if(!CONFIG.includeCharacters) { return; }

        // then simply create all suspects as often as required
        // (the "loupe" card is also just a suspect!)
        const suspects = CONFIG.expansions.traitor ? CONFIG.generation.suspectsTraitor : CONFIG.generation.suspectsBase;
        const freq = CONFIG.generation.defFrequencyForSuspect;
        for(const susp of suspects)
        {
            const freqTemp = SUSPECTS[susp].freq ?? freq;
            for(let i = 0; i < freqTemp; i++)
            {
                const card = new Card(Type.CHARACTER, susp);
                this.cardsSuspect.push(card);
            }
        }
    }

}