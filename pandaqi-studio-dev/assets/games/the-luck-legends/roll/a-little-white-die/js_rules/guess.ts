import fromArray from "js/pq_games/tools/random/fromArray";
import Hand from "./hand";

export default class Guess
{
    frequency: number = 0;
    number: number = 0;

    isEmpty()
    {
        return this.frequency <= 0;
    }

    isHigherThan(g:Guess)
    {
        return this.frequency > g.frequency || this.number > g.number;
    }

    matchesDiceResults(h:Hand)
    {
        const freqs = h.getFrequencies();
        return (freqs[this.number] ?? 0) >= this.frequency;
    }

    toString()
    {
        const suffix = this.frequency <= 1 ? "time" : "times";
        return "<i>Number " + this.number + " appears " + this.frequency + " " + suffix + "</i>";
    }

    formulate(prevGuess:Guess, myDice:Hand, allDice:Hand)
    {
        const myFreqs = myDice.getFrequencies();
        const myNumbers = Object.keys(myFreqs).map((x) => parseInt(x));

        if(prevGuess.isEmpty())
        {
            this.number = fromArray(myNumbers);
            this.frequency = Math.floor(Math.random() * 2) + 1;
            return;
        }

        const hasCurrentNumber = myNumbers.includes( prevGuess.number );
        let canRaiseNumber = prevGuess.number < 6;
        let nextHighestNumber = -1;
        for(const num of myNumbers)
        {
            if(num <= prevGuess.number) { continue; }
            nextHighestNumber = num;
            break;
        }
        if(nextHighestNumber <= 0) { canRaiseNumber = false; }

        let numDifferentResults = Object.keys(myFreqs).length;
        const maxFrequency = (allDice.count() - numDifferentResults + 1);
        let canRaiseFrequency = prevGuess.frequency < maxFrequency;

        // when all hope is lost, bluff it out
        // (we don't even have the current number, so raising its frequency would be a blind guess)
        if(!hasCurrentNumber && canRaiseFrequency)
        {
            // try going to a different number instead
            nextHighestNumber = prevGuess.number + 1 + Math.floor(Math.random() * (6 - prevGuess.number));
            if(nextHighestNumber <= 6) { canRaiseNumber = true; canRaiseFrequency = false; }

            // with some probability, just give up and challenge
            if(Math.random() <= 0.5 && !canRaiseNumber) { canRaiseNumber = false; canRaiseFrequency = false; }
        }

        if(!canRaiseNumber && !canRaiseFrequency) { return; }

        this.number = prevGuess.number;
        this.frequency = prevGuess.frequency;

        const raiseFrequency = !canRaiseNumber || (canRaiseFrequency && Math.random() <= 0.5);
        if(raiseFrequency)
        {
            const maxRaise = Math.min(maxFrequency - prevGuess.frequency, 2);
            const randRaise = Math.max( 1 + Math.floor(Math.random() * (maxRaise - 1)), 1);
            this.frequency += randRaise;
            return;
        }

        this.number = nextHighestNumber;
    }
}