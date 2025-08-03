import { CONFIG } from "../shared/config";
import { CardType, VoteType } from "../shared/dict";
import Card from "./card";

export const votePicker = () : Card[] =>
{
    const cards = [];
    generateVotesBase(cards);
    generateVotesAbstain(cards);
    return cards;
}

const generateVotesBase = (cards) =>
{
    if(!CONFIG.sets.base) { return; }

    // then just add those to 50% YES and 50% NO cards
    const numCards = CONFIG.generation.numVoteCards;

    let counter = 0;
    let number = 1;
    const numbers = [];
    const maxAbstainNumber = CONFIG.generation.numAbstainCards * 3;
    while(counter < numCards)
    {
        numbers.push(number);
        number++;
        if(number % 3 == 0 && number <= maxAbstainNumber) { number++; }
        counter++;
    }

    for(let i = 1; i <= numCards; i++)
    {
        const subType = (i % 2 == 0) ? VoteType.YES : VoteType.NO;
        const card = new Card(CardType.VOTE, subType);
        card.setNumber( numbers[i-1] );
        cards.push(card);
    }
}

const generateVotesAbstain = (cards) =>
{
    if(!CONFIG.sets.abstain) { return; }
    
    // create abstain cards with unique, ascending numbers
    // (even unique when related to other YES/NO cards! => all multiples of 3)
    const numCards = CONFIG.generation.numAbstainCards;
    for(let i = 1; i <= numCards; i++)
    {
        const num = i * 3;
        const card = new Card(CardType.VOTE, VoteType.ABSTAIN);
        card.setNumber(num);
        cards.push(card);
    }
}