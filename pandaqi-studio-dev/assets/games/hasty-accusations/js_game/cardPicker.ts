import getWeighted from "js/pq_games/tools/random/getWeighted";
import CONFIG from "../js_shared/config";
import { SETS, SUSPECTS, Type } from "../js_shared/dict";
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

        for(const [key, data] of Object.entries(set))
        {
            const min = data.freq.min ?? defFreqBounds.min;
            for(let i = 0; i < min; i++)
            {
                const card = new Card(Type.ACTION, key);
                this.cardsPlay.push(card);
            }

            freqs[key] = min;
        }

        while(this.cardsPlay.length < deckSize)
        {
            const key = getWeighted(set);
            const card = new Card(Type.ACTION, key);
            this.cardsPlay.push(card);
            freqs[key]++;

            const max = set[key].freq.max ?? defFreqBounds.max;
            if(freqs[key] >= max) { delete set[key]; }
        }
    }

    generateSuspectCards()
    {
        this.cardsSuspect = [];
        if(!CONFIG.includeCharacters) { return; }

        // then simply create all suspects as often as required
        // (the "spyglass" card is also just a suspect!)
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