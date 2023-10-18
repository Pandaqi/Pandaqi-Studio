import Card from "../js_game/card";
import { getIndexOfProp, countType, getNeighbors, getSequences, countWithNumAbove, countWithNumBelow, countPoisoned, countNumber, getHighestFrequency, getLowestFrequency, getFrequencyStatsSorted, countProp, getNumbers, countFood, getFrequencyStats, getTypes, getWithNumBelow, getWithNumAbove } from "./queries";

export default class PowerChecker
{
    getTrueCards(cards:Card[])
    {
        // reset card data
        for(const card of cards)
        {
            card.poisoned = false;
        }
        
        // eliminate duplicate numbers (that come later)
        const cardsToEvaluate = cards.slice();
        for(let i = cardsToEvaluate.length-1; i >= 0; i--)
        {
            let firstTypeIndex = getIndexOfProp(cardsToEvaluate, "num", cardsToEvaluate[i].num);
            const cardOccursEarlier = firstTypeIndex >= i;
            if(cardOccursEarlier) { continue; }
            cardsToEvaluate.splice(i,1);
        }

        // crucially, we sort the EVALUATION order, but not the cards list itself
        // that needs to stay in the order it was played (for adjacency checks and such)
        cardsToEvaluate.sort((a,b) => { return a.num - b.num; });

        // now evaluate all (that remain)
        for(const card of cardsToEvaluate)
        {
            if(!this.isTrue(card, cards)) { continue; }
            card.poisoned = true;
        }

        // poison status can change over time (during later sets), 
        // so we only collect them here by their final status
        const arr = [];
        for(const card of cardsToEvaluate)
        {
            if(!card.poisoned) { continue; }
            arr.push(card);
        }

        return arr;
    }

    isTrue(needle:Card, haystack:Card[])
    {
        return this[needle.food](needle, haystack);
    }

    //
    // STARTER
    //
    cream(a,b)
    {
        return countFood(b, "cookie") == 1;
    }

    pork(a,b)
    {
        return countFood(b, "pork") == 1;
    }

    wine(a,b)
    {
        const neighbors = getNeighbors(a,b);
        return countFood(neighbors, "cookie") > 0 || countFood(neighbors, "wine") > 0;
    }

    coffee(a,b)
    {
        const seqs = getSequences(b, "type");
        return seqs[0].length >= 3;
    }

    apple(a,b)
    {
        return countWithNumAbove(b, a.num) <= 0;
    }

    pear(a,b)
    {
        return countWithNumBelow(b, a.num) <= 0;
    }

    cookie(a,b)
    {
        return countPoisoned(b, true) <= 0;
    }

    mustard(a,b)
    {
        return countFood(b, "cookie") <= 0 && countFood(b, "mustard", [a]) <= 0;
        // OLD = return countFood(b, "cookie") <= 0;
    }

    pepper(a,b)
    {
        return countPoisoned(b, true) >= 2;
    }

    mint(a,b)
    {
        return true;
        //return countPoisoned(b, true) <= 0 && countFood(b, "cookie") <= 0;
    }

    //
    // BEGINNER
    //
    fish(a,b)
    {
        const max = getHighestFrequency(b, "food");
        const count = countFood(b, "fish");
        return count >= max;
    }

    cheese(a,b)
    {
        const min = getLowestFrequency(b, "food");
        const count = countFood(b, "cheese");
        return min <= count;
    }

    water(a,b)
    {
        const nbs = getNeighbors(a,b);
        return nbs[0].type == nbs[1].type;
    }

    milk(a,b)
    {
        const nbs = getNeighbors(a,b);
        return nbs[0].type != nbs[1].type;
    }

    orange(a,b)
    {
        return countNumber(b, a.numbersCustom[0], [a]) <= 0 && countNumber(b, a.numbersCustom[1], [a]) <= 0;
    }

    // @TODO: this one is hard to implement, but is it hard to play with?
    cauliflower(a,b)
    {
        const count = countWithNumAbove(b, a.numbersCustom[0]);
        const target = a.numbersCustom[1]; // @NOTE: "%num%" replacement comes before custom ones, that's why we need index 1 here, even though the target comes earlier in the card text
        return count >= target;
    }

    bread(a,b)
    {
        const list = getWithNumBelow(b, a.num);
        for(const elem of list)
        {
            if(!elem.poisoned) { return false; }
        }
        return true;

        // OLD = return countPoisoned(b, true, [a]) >= (b.length - 1); 
    }

    honey(a,b)
    {
        return getTypes(b).length <= 2;
        // OLD = return getHighestFrequency(b, "type", [a]) >= (b.length - 1);
    }

    cinnamon(a,b)
    {
        // @TODO: impossible without a sense of rounds
        return Math.random() <= 0.25;
    }

    ginger(a,b)
    {
        // @TODO: impossible without a sense of rounds
        return Math.random() <= 0.75;
    }

    //
    // AMATEUR
    //
    beef(a,b)
    {
        let sum1 = countWithNumAbove(b, 5);
        let sum2 = countWithNumBelow(b, 5);
        return sum1 > sum2;
    }

    eggs(a,b)
    {
        let max = getHighestFrequency(b, "food");
        return max >= 2;
    }

    // the difference with water is that water checks TYPE and this checks FOOD
    soup(a,b)
    {
        for(const elem of b)
        {
            const nbs = getNeighbors(elem, b);
            if(nbs[0].food == nbs[1].food) { return true; }
        }

        //const nbs = getNeighbors(a,b);
        //return nbs[0].food == nbs[1].food;
    }

    tea(a,b)
    {
        const seqs = getSequences(b, "type");
        return seqs[0].length <= 1;
    }

    // @TODO: not entirely correct, may be ties for most occurring frequency
    pea(a,b)
    {
        const count = countType(b, a.typesCustom[0]);
        const max = getHighestFrequency(b, "type");
        return count >= max;
    }

    cabbage(a,b)
    {
        const sum1 = countType(b, a.typesCustom[0]);
        const sum2 = countType(b, a.typesCustom[1]);
        return sum1 > sum2; 
    }

    wheat(a,b)
    {
        const list = getWithNumAbove(b, a.num);
        const needle = a.typesCustom[0];
        for(const elem of list)
        {
            if(elem.type != needle) { return false; }
        }
        return true;

        // OLD power
        //const count = countType(b, a.typesCustom[0], [a]);
        //return count >= b.length - 1;
    }

    rice(a,b)
    {
        const count = countType(b, a.typesCustom[0], [a]);
        return count <= 0;
    }

    nutmeg(a,b)
    {
        // @TODO: can't
        return Math.random() <= 0.25;
    }

    saffron(a,b)
    {
        // @TODO: can't
        return Math.random() <= 0.25;
    }

    //
    // ADVANCED
    //
    quail(a,b)
    {
        const freqs = getFrequencyStatsSorted(b, "food"); // always returns descending
        if(freqs.length <= 1) { return false; }
        return freqs[freqs.length-1].freq == freqs[freqs.length-2].freq;
    }

    ham(a,b)
    {
        const freqs = getFrequencyStatsSorted(b, "food");
        if(freqs.length <= 1) { return false; }
        return freqs[0].freq == freqs[1].freq;
    }

    mead(a,b)
    {
        const nbs = getNeighbors(a,b);
        return nbs[0].poisoned || nbs[1].poisoned;
    }

    ale(a,b)
    {
        const nbs = getNeighbors(a,b);
        const dn = a.numbersCustom[0];
        nbs[0].changeNum(dn);
        nbs[1].changeNum(dn);
        return false;
    }

    berries(a,b)
    {
        const count = countProp(b, "safe", true);
        return count > 0;
    }

    carrot(a,b)
    {
        const freq = getHighestFrequency(b, "food", [a]);
        return freq <= 1;
    }

    chocolate(a,b)
    {
        const nbs = getNeighbors(a,b);
        return (nbs[0].safe || nbs[0].food == "chocolate") || (nbs[1].safe || nbs[1].food == "chocolate");

        // OLD power
        //const count1 = countFood(b, "chocolate");
        //const count2 = countProp(b, "safe", true);
        //return (count1 + count2) >= b.length;
    }

    barley(a,b)
    {
        const nums = getNumbers(b);
        let maxDist = 0;
        for(const num1 of nums)
        {
            for(const num2 of nums)
            {
                maxDist = Math.max(maxDist, Math.abs(num2 - num1));
            }
        }
        return maxDist <= a.numbersCustom[0];
    }

    hazelnut(a,b)
    {
        // @TODO: can't
        return Math.random() <= 0.15;
    }

    almond(a,b)
    {
        let idx = b.indexOf(a);
        let needle = a.typesCustom[0];
        let target = a.numbersCustom[0];
        let minDist = Infinity;
        for(let i = 0; i < b.length; i++)
        {
            const elem = b[i];
            if(elem == a) { continue; }
            if(elem.type != needle) { continue; }

            const distLeft = (idx - i + b.length) % b.length;
            const distRight = (i - idx + b.length) % b.length;
            const dist = Math.min(distLeft, distRight); // get minimum of wrapping both ways
            minDist = Math.min(minDist,dist);
        }

        return minDist >= target;
    }

    //
    // EXPERT
    //
    chicken(a,b)
    {
        let avg = 0;
        for(const elem of b)
        {
            avg += elem.num;
        }
        avg /= b.length;
        return avg > 5.0;
    }

    // @TODO: not sure about this one
    butter(a,b)
    {
        const freqs = getFrequencyStatsSorted(b, "food");
        for(let i = 1; i < freqs.length; i++)
        {
            if(freqs[i].freq < 2) { break; } // played at least twice
            if(freqs[i].freq == freqs[i-1].freq) { return true; } // two foods are tied
        }
        return false;
    }

    beer(a,b)
    {
        const nbs = getNeighbors(a,b);
        nbs[0].flipPoisoned();
        nbs[1].flipPoisoned();
        return false;
    }

    cider(a,b)
    {
        const nbs = getNeighbors(a,b);
        return !nbs[0].poisoned && !nbs[1].poisoned;
    }

    broccoli(a,b)
    {
        const count = countProp(b, "safe", true);
        return count <= 0;
    }

    date(a,b)
    {
        let val = a.anyCustom[0];
        let prop = isNaN(parseInt(val)) ? "type" : "num";
        for(const elem of b)
        {
            if(elem[prop] != val) { continue; }
            elem.flipPoisoned();
        }
    }

    sugar(a,b)
    {
        for(const elem of b)
        {
            if(elem.type == "sugar") { continue; }
            const nbs = getNeighbors(elem, b);
            if(nbs[0].food != "sugar" && nbs[1].food != "sugar") { return false; }
        }
        return true;
    }

    porridge(a,b)
    {
        const count = countProp(b, "safe", true, [a]);
        return count >= (b.length - 1);
    }

    sage(a,b)
    {   
        let val = a.anyCustom[0];
        let prop = isNaN(parseInt(val)) ? "type" : "num";

        for(let i = b.length - 1; i >= 0; i--)
        {
            if(b[i][prop] != val) { continue; }
            b.splice(i, 1); 
        }

        return false;
    }

    parsley(a,b)
    {
        // @TODO: can't
        return false;
    }
}