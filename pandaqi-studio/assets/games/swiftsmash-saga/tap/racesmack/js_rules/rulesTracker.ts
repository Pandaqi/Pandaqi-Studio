import anyMatch from "js/pq_games/tools/collections/anyMatch";
import Card from "../js_game/card";
import { CardType, ShapeType } from "../js_shared/dict";

export default class RulesTracker
{
    isCorrect(ruleCard:Card, targetCard:Card, otherCards:Card[])
    {
        const func = this[ruleCard.action];
        return func.call(this, ruleCard, targetCard, otherCards);
    }

    isCorrectDefault(t:Card, o:Card[]) 
    {
        const extremeElements = this.getPropertySorted(o, "shape", true);
        if(extremeElements.length <= 0) { return false; }

        for(const elem of t.symbols)
        {
            if(!extremeElements.includes(elem)) { continue; }
            return true;
        }
        return false;
    }

    getNeighbors(t:Card, o:Card[])
    {
        const idx = o.indexOf(t);
        const idxLeft = (idx + o.length - 1) % o.length;
        const idxRight = (idx + 1) % o.length;
        return [ o[idxLeft], o[idxRight] ];
    }

    getKeyFromString(s:string)
    {
        return s.includes("color") ? "colors" : "symbols";
    }

    // this sorts ASCENDING by default
    getPropertySorted(o:Card[], prop:string, pickHighest = false)
    {
        const freqs = {};
        const key = this.getKeyFromString(prop);
        for(const card of o)
        {
            for(const elem of card[key])
            {
                freqs[elem] = (freqs[elem] ?? 0) + 1;
            }
        }
        const elems = Object.keys(freqs).sort((a:string, b:string) => {
            return freqs[a] - freqs[b];
        })

        const idx = pickHighest ? elems.length - 1 : 0; 
        const maxElemFreq = freqs[ elems[idx] ];

        const maxElems = elems.filter((x:string) => freqs[x] == maxElemFreq);
        return maxElems;
    }

    getPropertyFreqs(t:Card, prop:string)
    {
        const options = t[this.getKeyFromString(prop)];
        const freqs = {};
        for(const option of options)
        {
            freqs[option] = (freqs[option] ?? 0) + 1;
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

    freq(r: Card, t:Card, o:Card[])
    {
        const prop = r.dynamicValuesRule[0];
        const extreme = r.dynamicValuesRule[1];
        const pickHighest = (extreme == "most");
        const extremeElements = this.getPropertySorted(o, prop, pickHighest);
        const key = this.getKeyFromString(prop);
        for(const elem of t[key])
        {
            if(!extremeElements.includes(elem)) { continue; }
            return true;
        }
        return false;
    }

    variety(r: Card, t:Card, o:Card[])
    {
        const prop = r.dynamicValuesRule[0];
        const num = r.dynamicValuesRule[1];
        const compare = r.dynamicValuesRule[2];

        const freqs = this.getPropertyFreqs(t, prop);
        if(compare == "different") { return Object.values(freqs).length >= num; }
        return Object.keys(freqs).filter((k:string) => freqs[k] >= num).length > 0;
    }

    neighbors(r: Card, t:Card, o:Card[])
    {
        const nbs = this.getNeighbors(t, o);
        const key = this.getKeyFromString( r.dynamicValuesRule[0] );
        const compare = r.dynamicValuesRule[1];

        if(compare == "the exact same")
        {
            const hasFullMatch = this.arraysAreEqual(nbs[0][key], t[key]) || this.arraysAreEqual(nbs[1][key], t[key]);
            return hasFullMatch;
        }

        if(compare == "none of the same")
        {
            // @ts-ignore
            const hasFailedAnyMatch = !anyMatch(t[key], nbs[0][key]) || !anyMatch(t[key], nbs[0][key]);
            return hasFailedAnyMatch;
        }

        return true;
    }

    rules(r: Card, t:Card, o:Card[])
    {
        return t.type == CardType.RULE;
    }

    rules_adjacent(r: Card, t:Card, o:Card[])
    {
        const nbs = this.getNeighbors(t, o);
        return nbs[0].type == CardType.RULE || nbs[1].type == CardType.RULE;
    }

    // %num% comes before %compareNumber%
    number(r: Card, t:Card, o:Card[])
    {
        const myNumber = t.getNumber();
        const threshold = r.dynamicValuesRule[0];
        if(r.dynamicValuesRule[1] == "less than") { return myNumber < threshold; }
        return myNumber > threshold;
    }

    number_adjacent(r: Card, t:Card, o:Card[])
    {
        const nbs = this.getNeighbors(t, o);
        const myNumber = t.getNumber();
        return nbs[0].getNumber() == myNumber || nbs[1].getNumber() == myNumber;
    }

    // %properties% comes before %invert%
    duplicates(r: Card, t:Card, o:Card[])
    {
        const freqs = this.getPropertyFreqs(t, r.dynamicValuesRule[0]);
        const numDups = Object.keys(freqs).filter((k:string) => freqs[k] >= 2).length;
        if(r.dynamicValuesRule[1] == "no") { return numDups <= 0; }
        return numDups > 0;
    }
}