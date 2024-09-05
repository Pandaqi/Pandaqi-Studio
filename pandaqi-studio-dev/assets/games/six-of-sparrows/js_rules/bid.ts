import Card from "../js_game/card";

export default class Bid
{
    bidCard: Card
    handSize: number
    success: boolean

    constructor(bc:Card, hs:number)
    {
        this.bidCard = bc;
        this.handSize = hs;
    }

    toString()
    {
        return this.bidCard.key + " / " + this.handSize;
    }

    toStringDetailed()
    {
        return "I'll complete bid " + this.bidCard.key + "; I claimed it holding " + this.handSize + " cards.";
    }
}