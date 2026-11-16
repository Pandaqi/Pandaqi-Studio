import { Suit } from "../shared/dict";
import Hand from "./hand";
import Player from "./player";
import Sequence from "./sequence";

interface BidCheckerData
{
    tableHand: Hand,
    myHand: Hand,
    otherHands: Hand[]
}

export default class BidChecker
{
    check(bidCardKey:string, player:Player, players:Player[], tableHand:Hand) : boolean
    {
        const totalHand = new Hand();
        totalHand.addHand(tableHand);
        totalHand.addHand(player.hand);

        const playerHandsWithoutMe : Hand[] = [];
        for(const p of players)
        {
            if(p == player) { continue; }
            playerHandsWithoutMe.push(player.hand);
        }

        const extraData = {
            tableHand: tableHand,
            myHand: player.hand,
            otherHands: playerHandsWithoutMe
        }

        return this.isSuccess(bidCardKey, totalHand, extraData);
    }

    isSuccess(bidCardKey:string, cardsPlayed:Hand, extraData:BidCheckerData) : boolean
    {
        if(!this[bidCardKey]) { return false; }
        return this[bidCardKey](cardsPlayed, extraData);
    }

    countSameNumbers(c:Hand, setSize:number) : number
    {
        const freqs = c.getNumberFreqs();
        let sum = 0;
        for(const [num, freq] of Object.entries(freqs))
        {
            if(freq < setSize) { continue; }
            sum++;
        }
        return sum;
    }

    countSameSuits(c:Hand, setSize:number) : number
    {
        const freqs = c.getSuitFreqs();
        let sum = 0;
        for(const [suit, freq] of Object.entries(freqs))
        {
            if(freq < setSize) { continue; }
            sum++;
        }
        return sum;
    }

    countSequences(c:Hand, setSize:number, matchSuit = false) : number
    {
        // first, gather all our sequences, as long as possible
        let curSequence = new Sequence();
        const types = c.getNumberTypes();
        const sequences : Sequence[] = [];
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
            const numbersAreClose = prevNum == (myNum - 1);
            if(numbersAreClose)
            {
                curSequence.add(myNum);
                continue;    
            }

            sequences.push(curSequence);
            curSequence = new Sequence();
            curSequence.add(myNum);
        }
        sequences.push(curSequence);

        // weed out the invalid ones
        const sequencesValid : Sequence[] = [];
        for(const seq of sequences)
        {
            if(seq.count() < setSize) { continue; }

            // only keep the suits that match all
            // if none left, this sequence isn't possibly valid, abort
            // @NOTE: this basically tries all possible subsequences of size `setSize` within the sequence to find any single one where ALL suits might match => with a lot of early exits everywhere to prevent this being a performance hog!
            if(matchSuit)
            {
                const possibleSuits = Object.values(Suit);
                let hasFullMatch = false;
                for(let i = 0; i < seq.count() - setSize; i++)
                {
                    for(let j = 0; j < setSize; j++)
                    {
                        const suits = c.getSuitsForNumber(seq.numbers[i + j]);
                        for(let i = possibleSuits.length-1; i >= 0; i--)
                        {
                            if(suits.includes(possibleSuits[i])) { continue; }
                            possibleSuits.splice(i, 1);
                        }
                        if(possibleSuits.length <= 0) { break; }
                    }
    
                    if(possibleSuits.length <= 0) { continue; }
                    hasFullMatch = true;
                    break;
                }
                
                if(!hasFullMatch) { continue; }
            }

            sequencesValid.push(seq);
        }

        return sequencesValid.length;
    }

    getHighestTotal(hands:Hand[], type:string, target:any) : number
    {
        let highest = -1;
        for(const hand of hands)
        {
            const freqs = (type == "suit") ? hand.getSuitFreqs() : hand.getNumberFreqs();
            highest = Math.max(freqs[target] ?? 0, highest);
        }
        return highest;
    }

    getExtreme(hands:Hand[], dir:string) : number
    {
        let extremeValue = (dir == "highest") ? -Infinity : Infinity;
        for(const hand of hands)
        {
            for(const card of hand.cards)
            {
                extremeValue = (dir == "highest") ? Math.max(card.num, extremeValue) : Math.min(card.num, extremeValue);
            }
        }
        return extremeValue;
    }

    one_pair(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 2) >= 1;
    }

    two_pair(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 2) >= 2;
    }

    three_pair(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 2) >= 3;
    }

    one_trio(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 3) >= 1;
    }

    two_trio(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 3) >= 2;
    }

    three_trio(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 3) >= 3;
    }

    one_quatro(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 4) >= 1;
    }

    two_quatro(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 4) >= 2;
    }

    flush_short(c:Hand) : boolean
    {
        return this.countSameSuits(c, 4) >= 1;
    }

    flush_mid(c:Hand) : boolean
    {
        return this.countSameSuits(c, 5) >= 1;
    }

    flush_long(c:Hand) : boolean
    {
        return this.countSameSuits(c, 7) >= 1;
    }

    full_house_regular(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 2) >= 1 && this.countSameNumbers(c,3) >= 1;
    }

    full_house_medium(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 2) >= 2 && this.countSameNumbers(c,3) >= 1;
    }

    full_house_long(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 2) >= 2 && this.countSameNumbers(c,3) >= 2;
    }

    full_house_extreme(c:Hand) : boolean
    {
        return this.countSameNumbers(c, 2) >= 3 && this.countSameNumbers(c,3) >= 2;
    }

    straight_short(c:Hand) : boolean
    {
        return this.countSequences(c, 3) >= 1;
    }

    straight_mid(c:Hand) : boolean
    {
        return this.countSequences(c, 5) >= 1;
    }

    straight_long(c:Hand) : boolean
    {
        return this.countSequences(c, 7) >= 1;
    }

    straight_flush_short(c:Hand) : boolean
    {
        return this.countSequences(c, 2, true) >= 1;
    }

    straight_flush_mid(c:Hand) : boolean
    {
        return this.countSequences(c, 3, true) >= 1;
    }

    straight_flush_long(c:Hand) : boolean
    {
        return this.countSequences(c, 4, true) >= 1;
    }

    straight_flush_extreme(c:Hand) : boolean
    {
        return this.countSequences(c, 5, true) >= 1;
    }

    high_card(c:Hand, d:BidCheckerData) : boolean
    {
        return this.getExtreme([d.myHand], "highest") > this.getExtreme(d.otherHands, "highest");
    }

    low_card(c:Hand, d:BidCheckerData) : boolean
    {
        return this.getExtreme([d.myHand], "lowest") < this.getExtreme(d.otherHands, "lowest");
    }

    no_duplicates(c:Hand, d:BidCheckerData) : boolean
    {
        const myTypes = d.myHand.getNumberTypes();
        return myTypes.length >= d.myHand.count();
        /* const tableTypes = d.tableHand.getNumberTypes();
        for(const type of myTypes)
        {
            if(tableTypes.includes(type)) { return false; }
        }
        return true;*/
    }

    flush_hand(c:Hand, d:BidCheckerData) : boolean
    {
        const myTypes = d.myHand.getSuitTypes();
        const tableTypes = d.tableHand.getSuitTypes();
        for(const type of tableTypes)
        {
            if(!myTypes.includes(type)) { return false;}
        }
        return true;
    }

    majority_sparrows(c:Hand, d:BidCheckerData) : boolean
    {
        return (d.myHand.getSuitFreqs()[Suit.SPARROW] ?? 0) > this.getHighestTotal(d.otherHands, "suit", Suit.SPARROW);
    }

    majority_parrots(c:Hand, d:BidCheckerData) : boolean
    {
        return (d.myHand.getSuitFreqs()[Suit.PARROT] ?? 0) > this.getHighestTotal(d.otherHands, "suit", Suit.PARROT);
    }

    majority_eagles(c:Hand, d:BidCheckerData) : boolean
    {
        return (d.myHand.getSuitFreqs()[Suit.EAGLE] ?? 0) > this.getHighestTotal(d.otherHands, "suit", Suit.EAGLE);
    }

    majority_chickens(c:Hand, d:BidCheckerData) : boolean
    {
        return (d.myHand.getSuitFreqs()[Suit.CHICKEN] ?? 0) > this.getHighestTotal(d.otherHands, "suit", Suit.CHICKEN);
    }
}