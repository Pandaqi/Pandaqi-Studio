import Card from "../js_game/card";
import { CardType, ColorType, ShapeType } from "../js_shared/dict";

export default class FinishTracker
{
    hasFinished(scoredCards:Card[])
    {
        const ruleCards = scoredCards.filter((c:Card) => c.type == CardType.RULE);
        if(ruleCards.length <= 0) { return false; }

        const ruleCardHighest = ruleCards.sort((a:Card, b:Card) => b.uniqueNumber - a.uniqueNumber)[0];
        const otherCards = scoredCards.filter((c:Card) => c.type != CardType.RULE);
        const func = this[ruleCardHighest.finishReq];
        return func.call(this, ruleCardHighest, otherCards);
    }

    getFrequencySpecific(cards:Card[], value:string)
    {
        let freqs;
        if(Object.values(ColorType).includes(value as ColorType)) {
            freqs = this.getColorFrequencies(cards);
        } else {
            freqs = this.getShapeFrequencies(cards);
        }
        return freqs[value] ?? 0;
    }
    
    getColorFrequencies(cards:Card[])
    {
        const freqs = {};
        for(const card of cards)
        {
            for(const color of card.colors)
            {
                freqs[color] = (freqs[color] ?? 0) + 1;
            }
        }
        return freqs;
    }

    getShapeFrequencies(cards:Card[])
    {
        const freqs = {};
        for(const card of cards)
        {
            for(const shape of card.symbols)
            {
                freqs[shape] = (freqs[shape] ?? 0) + 1;
            }
        }
        return freqs;
    }

    arraysAreEqual(a:string[], b:string[]) : boolean
    {
        const aCopy = Array.from(new Set(a));
        const bCopy = Array.from(new Set(b));
        for(const elem of aCopy)
        {
            const idx = bCopy.indexOf(elem);
            if(idx < 0) { return false; }
            bCopy.splice(idx, 1);
        }
        return bCopy.length <= 0;
    }

    // %identifier% comes before %numhigh%
    specific_cards(r:Card, o:Card[])
    {
        const cardsMatch = [];
        const needle = r.dynamicValues[0];
        for(const card of o)
        {
            if(!card.hasIdentifierMatch(needle)) { continue; }
            cardsMatch.push(card);
        }
        return cardsMatch.length >= r.dynamicValues[1];
    }

    specific_individual(r:Card, o:Card[])
    {
        const needle = r.dynamicValues[0];
        return this.getFrequencySpecific(o, needle) >= r.dynamicValues[1];
    }

    num_cards(r:Card, o:Card[])
    {
        return o.length;
    }

    num_cards_cond(r:Card, o:Card[])
    {
        const threshold = r.dynamicValues[1];
        if(o.length < threshold) { return false; }

        const prop = r.dynamicValues[0];
        const key = prop.includes("color") ? "colors" : "symbols";
        for(let i = 1; i < o.length; i++)
        {
            const card = o[i];
            const neighbor = o[i-1];
            for(const elem of card[key])
            {
                // @ts-ignore
                if(neighbor[key].includes(elem)) { return false; }
            }
        }

        return true;
    }

    // %property% comes before %numlow%
    pairs(r:Card, o:Card[])
    {
        const prop = r.dynamicValues[0];
        let freqs;
        let numOptions;
        if(prop.includes("color")) { freqs = this.getColorFrequencies(o); numOptions = Object.values(ColorType).length; }
        if(prop.includes("shape")) { freqs = this.getShapeFrequencies(o); numOptions = Object.values(ShapeType).length; }
        
        const threshold = r.dynamicValues[1];
        let numAboveThreshold = Object.keys(freqs).filter((k:string) => freqs[k] >= threshold).length;
        return numAboveThreshold >= numOptions;
    }

    variety_cards(r:Card, o:Card[])
    {
        const threshold = r.dynamicValues[1];
        if(o.length < threshold) { return false; }

        const prop = r.dynamicValues[0];
        const key = prop == "colors" ? "colors" : "symbols";

        for(const cardA of o)
        {
            for(const cardB of o)
            {
                if(cardA == cardB) { continue; }
                if(!this.arraysAreEqual(cardA[key], cardB[key])) { continue; }
                return false;
            }
        }

        return true;
    }

    specific_double(r:Card, o:Card[])
    {
        const pair1 = { id: r.dynamicValues[0], num: r.dynamicValues[1] };
        const pair2 = { id: r.dynamicValues[2], num: r.dynamicValues[3] };
        return this.getFrequencySpecific(o, pair1.id) >= pair1.num && this.getFrequencySpecific(o, pair2.id) >= pair2.num;
    }

    specific_triple(r:Card, o:Card[])
    {
        const pair1 = { id: r.dynamicValues[0], num: r.dynamicValues[1] };
        const pair2 = { id: r.dynamicValues[2], num: r.dynamicValues[3] };
        const pair3 = { id: r.dynamicValues[4], num: r.dynamicValues[5] };
        return this.getFrequencySpecific(o, pair1.id) >= pair1.num && this.getFrequencySpecific(o, pair2.id) >= pair2.num && this.getFrequencySpecific(o, pair3.id) >= pair3.num;
    }
    

}