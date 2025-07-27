import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import { SPECIAL_CARDS } from "../shared/dict";
import Card from "./card";
import lerp from "js/pq_games/tools/numbers/lerp";
import clamp from "js/pq_games/tools/numbers/clamp";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        // the simple cards for the base game
        const maxNum:number = CONFIG.generation.defaultMaxNumOnCard;
        if(CONFIG.sets.base)
        {
            const dist:Record<string,number> = CONFIG.generation.numCardsPerColor;
            for(const [color,num] of Object.entries(dist))
            {
                for(let i = 0; i < num; i++)
                {
                    const factor = i / (num - 1); // this means that no matter how many cards the color has, its NUMBERS will still be spread out across that range evenly
                    const finalNum = lerp(1, maxNum, factor);
                    const numNotes = this.getNotesForNumber(finalNum);
                    this.cards.push(new Card(color, finalNum, "", numNotes));
                }
            }
        }

        // the special expansion cards
        if(CONFIG.sets.expansion)
        {
            let numCardsNeeded = 0;
            for(const [key,data] of Object.entries(SPECIAL_CARDS))
            {
                numCardsNeeded += data.freq ?? 1;
            }

            const allColors:string[] = Object.keys(CONFIG.generation.numCardsPerColor);
            const allNumbers:number[] = [];
            for(let i = 1; i <= maxNum; i++)
            {
                allNumbers.push(i);
            }

            const finalColors:string[] = [];
            const finalNumbers:number[] = [];
            while(finalColors.length < numCardsNeeded) { finalColors.push(...allColors); }
            while(finalNumbers.length < numCardsNeeded) { finalNumbers.push(...allNumbers); }

            shuffle(finalColors);
            shuffle(finalNumbers);

            for(const [key,data] of Object.entries(SPECIAL_CARDS))
            {
                const finalNum = finalNumbers.pop();
                const numNotes = this.getNotesForNumber(finalNum);
                this.cards.push(new Card(finalColors.pop(), finalNum, key, numNotes));
            }
        }

        console.log(this.cards);
    }

    getNotesForNumber(num:number)
    {
        const middleNum = 0.5 * (1 + CONFIG.generation.defaultMaxNumOnCard);
        const fractionRaw = 1.0 - Math.abs( num - middleNum ) / (middleNum - 1);
        const randomness = (Math.random() - 0.5) * 0.2;
        const fraction = clamp(fractionRaw + randomness, 0.0, 1.0);
        return Math.round( CONFIG.generation.noteBounds.lerp(fraction) );
    }
}