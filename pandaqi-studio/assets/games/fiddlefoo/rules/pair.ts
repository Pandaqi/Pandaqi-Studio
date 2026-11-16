import { Vector2 } from "lib/pq-games";
import Card from "../game/card";

export default class Pair
{
    cardPlayed:Card;
    posPlayed:Vector2;
    cardOther:Card;
    posOther:Vector2;

    rangeCached:number[];
    distanceCached:number;

    constructor(a:Card, ap:Vector2, b:Card, bp:Vector2)
    {
        this.cardPlayed = a;
        this.posPlayed = ap;
        this.cardOther = b;
        this.posOther = bp;

        this.cacheRange();
        this.cacheDistance();
    }

    getColor()
    {
        return this.cardPlayed.color;
    }

    cacheDistance()
    {
        this.distanceCached = Math.max(Math.abs(this.posPlayed.x - this.posOther.x) + Math.abs(this.posPlayed.y - this.posOther.y) - 1, 0);
    }

    getDistance() : number
    {
        return this.distanceCached;
    }

    cacheRange()
    {
        const numA = this.cardPlayed.num;
        const numB = this.cardOther.num;
        const numMin = Math.min(numA, numB) + 1;
        const numMax = Math.max(numA, numB) - 1;
        const arr : number[] = [];
        for(let i = numMin; i <= numMax; i++)
        {
            arr.push(i);
        }
        this.rangeCached = arr;
    }

    inRange(num:number)
    {
        return this.rangeCached.includes(num);
    }

    getRangeSize()
    {
        return this.rangeCached.length;
    }

    getRange() : number[]
    {
        return this.rangeCached;
    }
}