import CONFIG from "../shared/config";
import { CardType, VoteType } from "../shared/dict";
import Card from "./card";

export default class VotePicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];
        this.generateVoteCards();
        console.log(this.cards);
    }

    generateVoteCards()
    {
        if(!CONFIG.sets.base) { return; }

        const num = CONFIG.generation.numVoteCards;
        const mainType = CardType.VOTE;
        for(let i = 1; i <= num; i++)
        {
            const subType = (i % 2 == 0) ? VoteType.YES : VoteType.NO;
            const card = new Card(mainType, subType);
            card.num = i;
            this.cards.push(card);
        }
    }
}