import Card from "../game/card";
import { CONFIG } from "../shared/config";
import { DYNAMIC_OPTIONS } from "../shared/dict";
import Board from "./board";

export default class ContractValidator
{
    validate(contract:Card, b:Board) : boolean
    {
        const key = contract.contractKey;
        if(typeof this[key] !== "function")
        {
            console.error("Can't validate contract of type " + key);
            return false;
        }
        return this[key](contract.getDynamicDetails(), b);
    }

    // helper functions
    listsMatch(a:any[], b:any[])
    {
        const arr = b.slice();
        for(const elem of a)
        {
            if(!arr.includes(elem)) { continue; }
            arr.splice(arr.indexOf(elem), 1);
        }
        return arr.length <= 0;
    }

    inNumericalOrder(pathSoFar:Card[], newOption:Card)
    {
        if(pathSoFar.length <= 0) { return true; }
        return newOption.number == (pathSoFar[pathSoFar.length-1].number + 1);
    }

    // 1 card
    one_number(details:any[], b:Board)
    {
        return b.countCardsWith("number", details[0]) >= 1;
    }

    one_suit_options_number(details:any[], b:Board)
    {
        const pos = b.getPositionsWith("suit", details[0]);
        for(const p of pos)
        {
            if(details.includes(b.getCard(p).number)) { return true; }
        }
        return false;
    }

    // 2 cards
    pair_with_suits_any(details:any[], b:Board)
    {
        return b.hasNumberSetWithSuits(2, details);
    }

    pair_with_suits_adjacent_any(details:any[], b:Board)
    {
        const positions = b.getAllPositions(true);
        for(const pos of positions)
        {
            const card = b.getCard(pos);
            if(!details.includes(card.suit)) { continue; }

            const nbCards = b.getNeighborCardsOf(pos);
            for(const nbCard of nbCards)
            {
                if(!details.includes(nbCard.suit)) { continue; }
                if(nbCard.number != card.number) { continue; }
                return true;
            }
        }
        return false;
    }

    pair(details:any[], b:Board)
    {
        for(const detail of details)
        {
            if(b.countCardsWith("number", detail) >= 2) { return true; }
        }
        return false;
    }

    pair_adjacent(details:any[], b:Board)
    {
        for(const detail of details)
        {
            const positions = b.getPositionsWith("number", detail);
            for(const pos of positions)
            {
                const card = b.getCard(pos);
                const nbCards = b.getNeighborCardsOf(pos);
                for(const nbCard of nbCards)
                {
                    if(nbCard.number == card.number) { return true; }
                }
            }
        }
        return false;
    }

    // 3 cards
    trio_any(details:any[], b:Board)
    {
        return b.countDuplicatesOf("number", 3);
    }

    trio_with_suits_any(details:any[], b:Board)
    {
        return b.hasNumberSetWithSuits(3, [], [details[0]])
    }

    trio_adjacent_any(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            if(pathSoFar.length <= 0) { return true; }
            return newOption.number == pathSoFar[0].number;
        }
        return b.hasSequenceOfLength(callback, 3, true);  
    }

    trio(details:any[], b:Board)
    {
        for(const detail of details)
        {
            if(b.countCardsWith("number", detail) >= 3) { return true; }
        }
        return false;
    }

    // 4 cards
    pair_double_with_suits_any(details:any[], b:Board)
    {
        return b.hasNumberSetWithSuits(2, details, [], 2);
    }

    pair_double(details:any[], b:Board)
    {
        return b.countCardsWith("number", details[0]) >= 2 && b.countCardsWith("number", details[1]) >= 2;
    }

    four_number_any(details:any[], b:Board)
    {
        return b.countDuplicatesOf("number", 4);
    }

    four_number(details:any[], b:Board)
    {
        for(const detail of details)
        {
            if(b.countCardsWith("number", detail) >= 4) { return true; }
        }
        return false;
    }

    four_suit_adjacent_any(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            return pathSoFar.length <= 0 ? true : newOption.suit == pathSoFar[0].suit;
        }
        return b.hasSequenceOfLength(callback, 4, true);
    }

    four_suit(details:any[], b:Board)
    {
        return b.countCardsWith("suit", details[0]) >= 4;
    }

    // 5 cards
    straight(details:any[], b:Board)
    {
        return b.hasStraightOfLength(CONFIG.rulebook.lengthOfStraights ?? 5);
    }

    straight_adjacent(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            return this.inNumericalOrder(pathSoFar, newOption);
        }
        return b.hasSequenceOfLength(callback, CONFIG.rulebook.lengthOfAdjacentStraightFlushes ?? 5, true);  
    }

    straight_restricted(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            const numOrd = this.inNumericalOrder(pathSoFar, newOption);
            const restrictionHolds = pathSoFar.length == 0 ? newOption.number <= details[0] : true; 
            return numOrd && restrictionHolds;
        }
        return b.hasSequenceOfLength(callback, CONFIG.rulebook.lengthOfHardStraights ?? 5);
    }

    straight_flush_any(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            const numOrd = this.inNumericalOrder(pathSoFar, newOption);
            const sameSuit = pathSoFar.length > 0 ? pathSoFar[0].suit == newOption.suit : true;
            return numOrd && sameSuit;
        }
        return b.hasSequenceOfLength(callback, CONFIG.rulebook.lengthOfHardStraights ?? 5);
    }

    straight_flush_any_adjacent(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            const numOrd = this.inNumericalOrder(pathSoFar, newOption);
            const sameSuit = pathSoFar.length > 0 ? pathSoFar[0].suit == newOption.suit : true;
            return numOrd && sameSuit;
        }
        return b.hasSequenceOfLength(callback, CONFIG.rulebook.lengthOfAdjacentStraightFlushes ?? 5, true);
    }

    straight_flush(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            const numOrd = this.inNumericalOrder(pathSoFar, newOption);
            const correctSuit = (newOption.suit == details[0]);
            return numOrd && correctSuit;
        }
        return b.hasSequenceOfLength(callback, CONFIG.rulebook.lengthOfHardStraights ?? 5);
    }

    royal_flush(details:any[], b:Board)
    {
        return b.hasRoyalFlush(CONFIG.rulebook.lengthOfRoyalFlush ?? 5);
    }

    royal_flush_adjacent(details:any[], b:Board)
    {
        return b.hasRoyalFlush(CONFIG.rulebook.lengthOfRoyalFlush ?? 5, true);
    }

    flush_any(details:any[], b:Board)
    {
        return b.countDuplicatesOf("suit", CONFIG.rulebook.lengthOfFlushes ?? 5);
    }

    flush(details:any[], b:Board)
    {
        return b.countCardsWith("suit", details[0]) >= (CONFIG.rulebook.lengthOfFlushes ?? 5);
    }

    full_house_any(details:any[], b:Board)
    {
        const stats = b.getPropStats("number");
        let hasPair = false;
        let hasTrio = false;
        for(const [key,freq] of Object.entries(stats))
        {
            if(freq >= 3 && !hasTrio) { hasTrio = true; }
            else if(freq >= 2 && !hasPair) { hasPair = true; }
            if(hasPair && hasTrio) { return true; }
        }

        return false;
    }

    full_house_adjacent(details:any[], b:Board)
    {
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            if(pathSoFar.length < 2) { return true; }
            
            const numbersSoFar = {};
            for(const card of pathSoFar)
            {
                if(!numbersSoFar[card.number]) { numbersSoFar[card.number] = 0; }
                numbersSoFar[card.number]++;
            }

            const includedNumbers = Object.keys(numbersSoFar).map((x) => parseInt(x));

            // if we already have our DUO and TRIO, and this number isn't one of them, back out
            if(includedNumbers.length >= 2 && !includedNumbers.includes(newOption.number)) { return false; }

            // if we want to add a number to what's already a trio, back out
            if(numbersSoFar[newOption.number] >= 3) { return false; }

            return true;
        }
        return b.hasSequenceOfLength(callback, 5);
    }

    full_house(details:any[], b:Board)
    {
        const stats = b.getPropStats("number");

        let hasTrio = false;
        let hasPair = false;
        for(const detail of details)
        {
            if(!hasTrio && (stats[detail] ?? 0) >= 3) { hasTrio = true; }
            else if(!hasPair && (stats[detail] ?? 0) >= 2) { hasPair = true; }
            if(hasTrio && hasPair) { return true; }
        }
        return false;
    }

    // 6 cards
    trio_double_any(details:any[], b:Board)
    {
        return b.countDuplicateSetsOf("number", 3, 2);
    }

    trio_double_with_suits_any(details:any[], b:Board)
    {
        return b.hasNumberSetWithSuits(3, [], [details[0]], 2);
    }

    trio_double(details:any[], b:Board)
    {
        let numTrios = 0;
        for(const detail of details)
        {
            if(b.countCardsWith("number", detail) >= 3) { numTrios++; }
        }
        return numTrios >= 2;
    }

    // row/column contracts
    row_suit_any(details:any[], b:Board)
    {
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            for(const [key,freq] of Object.entries(row.suitFreqs))
            {
                if(freq >= 3) { return true; }
            }
        }
        return false;
    }

    row_number_any(details:any[], b:Board)
    {
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            for(const [key,freq] of Object.entries(row.numberFreqs))
            {
                if(freq >= 3) { return true; }
            }
        }
        return false;
    }

    row_suit(details:any[], b:Board)
    {
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            if(row.suitFreqs[details[0]] >= 3) { return true; }
        }
        return false;
    }

    row_number(details:any[], b:Board)
    {
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            if(row.numberFreqs[details[0]] >= 2) { return true; }
        }
        return false;
    }

    // variety contracts
    variety_suit(details:any[], b:Board)
    {
        const suits = b.getAllUniqueOfProp("suit");
        return this.listsMatch(suits, DYNAMIC_OPTIONS["%suit%"]);
    }

    variety_suit_adjacent(details:any[], b:Board)
    {
        const maxNumSuits = DYNAMIC_OPTIONS["%suit%"].length;
        const callback = (pathSoFar:Card[], newOption:Card) =>
        {
            for(const card of pathSoFar)
            {
                if(card.suit == newOption.suit) { return false; }
            }
            return true;
        }

        return b.hasSequenceOfLength(callback, maxNumSuits, true);
    }

    variety_number(details:any[], b:Board)
    {
        const numbers = b.getAllUniqueOfProp("number");
        return this.listsMatch(numbers, DYNAMIC_OPTIONS["%number%"]);
    }

    variety_row(details:any[], b:Board)
    {
        const suitOptions = DYNAMIC_OPTIONS["%suit%"];
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            if(this.listsMatch(row.suits, suitOptions)) { return true; }
        }
        return false;
    }

    variety_suit_row_lack(details:any[], b:Board)
    {
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            if(row.suitsUnique.length <= 1) { return true; }
        }
        return false;
    }

    variety_number_row_lack(details:any[], b:Board)
    {
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            if(row.numbersUnique.length <= 1) { return true; }
        }
        return false;
    }

    variety_both_row_lack(details:any[], b:Board)
    {
        const rowStats = b.getRowStats();
        for(const row of rowStats)
        {
            if(row.suitsUnique.length <= 1 && row.numbersUnique.length <= 1) { return true; }
        }
        return false;
    }

    //
    // @NOTE: all the expansion contracts haven't been programmed; too difficult and useless to me
    //
}
