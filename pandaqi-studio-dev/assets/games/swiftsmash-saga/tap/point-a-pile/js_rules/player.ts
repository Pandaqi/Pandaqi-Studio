import Hand from "./hand";
import ScoreTracker from "./scoreTracker";

export default class Player
{
    num = -1
    scored: Hand

    constructor(n:number)
    {
        this.num = n;
        this.scored = new Hand();
    }

    getScore(t:ScoreTracker)
    {
        let score = 0;
        const allCards = this.scored.cards;
        for(const card of allCards)
        {
            score += t.calculate(card, allCards) ?? 0;
        }
        return score;
    }
}