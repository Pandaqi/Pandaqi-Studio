import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "../js_shared/config";
import Hand from "./hand";
import Sequence from "./sequence";
import { SUITS } from "../js_shared/dict";

enum GuessType
{
    NONE = "none",
    SPECIFIC = "specific",
    STRAIGHT = "straight",
    VAGUE = "vague"
}

enum GuessTarget
{
    NONE = "none",
    NUMBER = "number",
    COLOR = "color"
}

export { GuessTarget, GuessType };
export default class Guess
{
    type: GuessType = GuessType.NONE;
    number: number = 0;
    target: GuessTarget = GuessTarget.NONE;
    targetNumber: number = 0;
    targetColor: string = "";
    modifier: boolean = false;

    isEmpty()
    {
        return this.number <= 0 || this.target == GuessTarget.NONE || this.type == GuessType.NONE;
    }

    reset()
    {
        this.number = 0;
        this.target = GuessTarget.NONE;
        this.type = GuessType.NONE;
        this.modifier = false;
    }

    isHigherThan(g:Guess)
    {
        let prevNum = g.number;

        // pretend the previous number was something else for easy checks on being higher
        if(g.type == GuessType.VAGUE && this.type != GuessType.VAGUE)
        {
            prevNum = prevNum * 0.5;
        }

        if(g.type != GuessType.VAGUE && this.type == GuessType.VAGUE)
        {
            prevNum = 2*prevNum;
        }

        // then do the check per type
        if(this.type == GuessType.SPECIFIC || this.type == GuessType.VAGUE) 
        { 
            return this.number > prevNum;
        }

        if(this.type == GuessType.STRAIGHT)
        {
            return this.number > prevNum || this.targetNumber > prevNum;
        }

        return false;
    }

    getTypesFromFrequencies(freqs:Record<any,number>)
    {
        let types = [];
        if(this.target == GuessTarget.NUMBER) { 
            types = Object.keys(freqs).map((x) => parseInt(x));
        } else if(this.target == GuessTarget.COLOR) {
            types = Object.keys(freqs);
        }
        return types;
    }

    matchesDiceResults(h:Hand) : boolean
    {
        const freqs = h.getFrequencies(this.target);
        let types = this.getTypesFromFrequencies(freqs);

        // base type for specific guesses
        if(this.type == GuessType.SPECIFIC)
        {
            // the base value just means "check the frequency for that specific thing"
            const targetValue = this.target == GuessTarget.NUMBER ? this.targetNumber : this.targetColor;
            let freq = freqs[targetValue];

            // the modifiers do more weird shit
            if(this.modifier)
            {
                freq = 0;

                // the "at most NUMBER" modifier
                if(this.target == GuessTarget.NUMBER) 
                {
                    for(const type of types)
                    {
                        if(type > targetValue) { continue; }
                        freq += freqs[type];
                    }
                }

                // the "without COLOR" (inverted) modifier
                if(this.target == GuessTarget.COLOR)
                {
                    for(const type of types)
                    {
                        if(type == targetValue) { continue; }
                        freq += freqs[type];
                    }
                }
            }

            // return if we pass the threshold
            return freq >= this.number;
        }

        // count the thing that has the most duplicates ( = highest frequency of that same number/color)
        // then check if it passes our threshold 
        if(this.type == GuessType.VAGUE)
        {
            let bestKey = null;
            let bestVal = -1;
            for(const type of types)
            {
                if(freqs[type] <= bestVal) { continue; }
                bestVal = freqs[type];
                bestKey = type;
            }
            return bestVal >= this.number;
        }

        if(this.type == GuessType.STRAIGHT)
        {
            types.sort(); // sorts all numbers in play ascending

            // divide this into sequences
            let curSequence = new Sequence();
            const sequences = [];
            for(let i = 0; i < types.length; i++)
            {
                const myNum = types[i];
                if(i == 0)
                {
                    curSequence = new Sequence();
                    curSequence.add(myNum);
                    continue;
                }

                const prevNum = types[i-1];
                if(prevNum == (myNum - 1))
                {
                    curSequence.add(myNum);
                    continue;    
                }

                sequences.push(curSequence);
                curSequence = new Sequence();
                curSequence.add(myNum);
            }
            sequences.push(curSequence);

            // search if the one we want exists
            for(const seq of sequences)
            {
                if(seq.count() < this.number) { continue; }
                if(!seq.has(this.targetNumber)) { continue; }
                return true;
            }

            return false;
        }

        return true;
    }

    toString() : String
    {
        const cardNoun = this.number <= 1 ? "card" : "cards";
        const targetValue = this.target == GuessTarget.NUMBER ? this.targetNumber : this.targetColor;

        let strTarget = (this.target == GuessTarget.COLOR) ? " color" : " number";
        let strConnector = "with the"
        if(this.modifier)
        {
            if(this.target == GuessTarget.NUMBER) { strConnector = "with at most the"; }
            else if(this.target == GuessTarget.COLOR) { strConnector = "without the"; }
        }

        let strMid = strConnector + " " + strTarget + " " + targetValue;
        if(this.type == GuessType.STRAIGHT)
        {
            strMid = "in numeric order, including a " + targetValue;
        }

        if(this.type == GuessType.VAGUE)
        {
            strMid = "of the same " + targetValue;
        }

        return "<i>" + this.number + " " + cardNoun + " " + strMid + "</i>";
    }

    // @TODO: doesn't support STRAIGHT and VAGUE at the moment
    listAllPossibleGuesses(prevGuess:Guess, cutoff:number = 3)
    {
        const colorOptions = Object.keys(SUITS);
        const numberOptions = CONFIG.generation.baseCardsPerSuit.asList();
        
        const arr : Guess[] = [];
        for(let i = 1; i <= cutoff; i++)
        {
            const newNum = prevGuess.number + i;

            for(const target of [GuessTarget.COLOR, GuessTarget.NUMBER])
            {
                for(let m = 0; m < 2; m++)
                {
                    const isModified = m == 0;

                    const isColorTarget = (target == GuessTarget.COLOR);
                    const options = isColorTarget ? colorOptions : numberOptions; 
                    const maxOptions = isColorTarget ? numberOptions.length : colorOptions.length; // @NOTE: YES, this should precisely be inverted
                    if(newNum > maxOptions && !isModified) { continue; } // modifier raises these numbers in unpredictable ways, so just ignore then

                    for(const option of options)
                    {
                        if(!isColorTarget && option <= 2 && isModified) { continue; } // "at most" is useless on really low numbers

                        const g = new Guess();
                        g.type = GuessType.SPECIFIC;
                        g.number = newNum;
                        g.target = target;
                        g.modifier = isModified;

                        if(isColorTarget) { g.targetColor = option; }
                        else { g.targetNumber = option; }

                        arr.push(g);
                    }
                }
            }
        }
        return arr;
    }

    // @NOTE: not clean, but it works
    copy(g:Guess)
    {
        for(const key of Object.keys(g))
        {
            this[key] = g[key];
        }
    }

    formulate(prevGuess:Guess, myDice:Hand, allDice:Hand)
    {
        // collect all options (until a reasonable cutoff point)
        const cutoff = Math.max( Math.min(3, allDice.count() - prevGuess.number), 0);
        const options : Guess[] = this.listAllPossibleGuesses(prevGuess, cutoff);
        if(options.length <= 0)
        {
            this.reset();
            return;
        }

        // @TODO: take myDice and allDice into account to make slightly smarter guesses
        const optionsFiltered : Guess[] = [];
        for(const o of options)
        {
            const freqs = myDice.getFrequencies(o.target);

            // TWEAK 1: Don't bet on colors (unmodified) that you don't have; or colors (modified) that you do have
            if(o.target == GuessTarget.COLOR) 
            {
                const iHaveThatColor = (freqs[o.targetColor] ?? 0) > 0;
                if(iHaveThatColor == o.modifier) { continue; }
            }

            // TWEAK 2: Don't bet on numbers (unmodified) that you don't have
            if(o.target == GuessTarget.NUMBER)
            {
                const iHaveThatNumber = (freqs[o.targetNumber] ?? 0) > 0;
                if(!o.modifier && !iHaveThatNumber) { continue; }
            }

            optionsFiltered.push(o);
        }

        // pick a random one and become that
        const randOption = fromArray(optionsFiltered);
        this.copy(randOption);
    }
}