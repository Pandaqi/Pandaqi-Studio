export default class Bid
{
    numWins: number
    handSize: number

    constructor(nw:number, hs:number)
    {
        this.numWins = nw;
        this.handSize = hs;
    }

    toString()
    {
        return this.numWins + " / " + this.handSize;
    }

    toStringDetailed()
    {
        return "I'll win " + this.numWins + " challenges; I said this holding " + this.handSize + " cards.";
    }
}