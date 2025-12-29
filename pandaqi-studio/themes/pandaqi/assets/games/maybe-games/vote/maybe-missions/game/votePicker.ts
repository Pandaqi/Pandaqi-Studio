import { CONFIG } from "../shared/config";
import { CardType, VoteType } from "../shared/dict";
import Card from "./card";

export const votePicker = () : Card[] =>
{
    const cards = [];
    generateVoteCards(cards);
    return cards;
}

const generateVoteCards = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }

    const num = CONFIG.generation.numVoteCards;
    const mainType = CardType.VOTE;
    for(let i = 1; i <= num; i++)
    {
        const subType = (i % 2 == 0) ? VoteType.YES : VoteType.NO;
        const card = new Card(mainType, subType);
        card.num = i;
        cards.push(card);
    }
}