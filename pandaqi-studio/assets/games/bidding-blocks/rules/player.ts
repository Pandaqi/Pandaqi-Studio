import Card from "../game/card";
import { TEMPLATES } from "../shared/dict";
import Bid from "./bid";
import Hand from "./hand";

export default class Player
{
    num = -1
    hand: Hand
    bid:Bid
    challengesWon:number = 0
    score:number = 0

    constructor(n:number)
    {
        this.num = n;
    }

    getValidMoves(cardsPlayed:Hand) : Card[]
    {
        // if nothing played before, we can play anything!
        if(cardsPlayed.count() <= 0) { return this.hand.cards.slice(); }

        // otherwise, select any card with higher number or fitting suit
        const lastCard = cardsPlayed.getLast();
        const arr = [];
        for(const card of this.hand.cards)
        {
            const higherNumber = card.num > lastCard.num;
            const fitsOnTop = TEMPLATES[card.suit].fitsOnTop.includes(lastCard.suit);
            if(!(higherNumber || fitsOnTop)) { continue; }
            arr.push(card);
        }
        
        return arr;
    }
}