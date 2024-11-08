import Card from "../js_game/card";
import { ColorType } from "../js_shared/dict";
import Combo from "./combo";
import Hand from "./hand";

export default class Player
{
    num = -1
    hand: Hand
    bid: Hand
    score: Hand
    stopped: boolean = false;
    bestCombo: Combo

    constructor(n:number)
    {
        this.num = n;
        this.score = new Hand();
    }

    stop()
    {
        this.stopped = true;
    }

    reset(cards:Card[])
    {
        this.hand = new Hand().addCards(cards);
        this.bid = new Hand();
        this.stopped = false;
        this.bestCombo = null;
    }

    scoreCards(cards:Card[])
    {
        this.score.addCards(cards);
    }

    getTotalBid() : number
    {
        return this.sumCards(this.bid.cards);
    }

    getTotalScore() : number
    {
        return this.sumCards(this.score.cards);
    }

    sumCards(c:Card[]) : number
    {
        let sum = 0;
        for(const card of c)
        {
            sum += card.num ?? 0;
        }
        return sum;
    }

    getTotalHandValue() : number
    {
        return this.sumCards(this.hand.cards);
    }

    calculateBestCombo(pakjesKamer:Card[])
    {
        if(this.stopped) { this.bestCombo = new Combo(); return; }

        // try all possible combos of numbers and colors
        // but cache them to prevent re-calculating things we already know
        const allCards : Card[] = [this.hand.cards, pakjesKamer].flat();
        const colorCombos : Record<string,Combo> = {};
        const numberCombos : Record<number,Combo> = {};
        for(const card of allCards)
        {
            if(!(card.color in colorCombos))
            {
                colorCombos[card.color] = new Combo(allCards).filter("color", card.color);
            }

            if(!(card.num in numberCombos))
            {
                numberCombos[card.num] = new Combo(allCards).filter("num", card.num);
            }
        }

        const allCombos = [Object.values(colorCombos), Object.values(numberCombos)].flat();
        allCombos.sort((a:Combo, b:Combo) => a.compareTo(b));
        this.bestCombo = allCombos[0];
    }
}