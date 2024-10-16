import Hand from "./hand";

export default class Player
{
    num = -1
    hand: Hand
    scored: Hand

    constructor(n:number)
    {
        this.num = n;
        this.hand = new Hand();
        this.scored = new Hand();
    }
}