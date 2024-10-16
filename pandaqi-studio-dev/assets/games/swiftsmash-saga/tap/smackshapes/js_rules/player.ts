import Hand from "./hand";

export default class Player
{
    num = -1
    hand: Hand

    constructor(n:number)
    {
        this.num = n;
    }
}