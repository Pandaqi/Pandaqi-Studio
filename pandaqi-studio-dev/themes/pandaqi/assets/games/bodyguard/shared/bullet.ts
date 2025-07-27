import Card from "../js_game/card";

export default class Bullet
{
    shooter: Card;
    idx: number;
    dir: number;
    alive: boolean;
    stepsTaken: number;
    hitSomething: boolean;

    constructor(sht: Card, idx:number, dir:number)
    {
        this.shooter = sht;
        this.idx = idx;
        this.dir = dir;
        this.alive = true;
        this.stepsTaken = 0;
    }

    step(cards:Card[])
    {
        this.idx = (this.idx + this.dir + cards.length) % cards.length;
        this.stepsTaken++;
    }

    reachedMax(max:number)
    {
        return this.stepsTaken > max;
    }

    getCurrentCard(cards:Card[])
    {
        const card = cards[this.idx];
        if(card.immune) { return null; }
        return card;
    }

    isAlive()
    {
        return this.alive;
    }

    kill()
    {
        this.alive = false;
        this.hitSomething = true;
    }
}