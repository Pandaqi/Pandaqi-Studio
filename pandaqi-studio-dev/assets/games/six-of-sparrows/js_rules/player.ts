import Card from "../js_game/card";
import { TEMPLATES } from "../js_shared/dict";
import Bid from "./bid";
import BidChecker from "./bidChecker";
import Hand from "./hand";

export default class Player
{
    num = -1
    hand: Hand
    bid:Bid = null;
    challengesWon:number = 0
    score:number = 0

    constructor(n:number)
    {
        this.num = n;
    }

    hasBid()
    {
        return this.bid != null;
    }

    calculateAndSaveScore(tableHand:Hand, players:Player[])
    {
        if(!this.hasBid()) { return; }

        const totalHand = new Hand();
        totalHand.addHand(tableHand);
        totalHand.addHand(this.hand);

        const playerHandsWithoutMe : Hand[] = [];
        for(const player of players)
        {
            if(player == this) { continue; }
            playerHandsWithoutMe.push(player.hand);
        }

        const extraData = {
            tableHand: tableHand,
            myHand: this.hand,
            otherHands: playerHandsWithoutMe
        }

        const success = new BidChecker().check(this.bid.bidCard, totalHand, extraData);
        this.bid.success = success;

        let score = Math.round(this.bid.bidCard.getValue() / this.bid.handSize);
        if(!success) { score *= -1; }
        this.score = score;
    }
}