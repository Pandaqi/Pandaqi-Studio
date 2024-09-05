import shuffle from "js/pq_games/tools/random/shuffle";
import Hand from "./hand";

export default class Player
{
    num = -1
    hand: Hand
    dice: Hand[]

    constructor(n:number)
    {
        this.num = n;
    }

    rollDice(num:number)
    {
        this.dice = [];

        // for players who have less than requested, prevent trying to overdraw
        num = Math.min(this.hand.count(), num);

        const randOrder = [];
        for(let i = 0; i < num; i++)
        {
            this.dice.push(new Hand());
            randOrder.push(i);
        }
        shuffle(randOrder);
        
        // now we simply do a "balanced fill": add 1 card to each pile until we've added 1 to all, then repeat for the second card, etcetera
        // this ensures dice are always at least size 2 (per the rules) IF POSSIBLE; otherwise it still works fine
        const cardsCopy = shuffle( this.hand.cards.slice() );
        let cardsToDistribute = cardsCopy.length;
        let orderCounter = 0;
        while(cardsToDistribute > 0)
        {
            orderCounter = (orderCounter + 1) % randOrder.length;
            const diceIndex = randOrder[orderCounter];
            this.dice[diceIndex].addCard(cardsCopy.pop());
            cardsToDistribute--;
        }

        // finally, shuffle the dice
        for(const d of this.dice)
        {
            shuffle(d.cards);
        }
    }

    getDiceTopCards() : Hand
    {
        const h = new Hand();
        for(const d of this.dice)
        {
            h.addCard(d.getFirst());
        }
        return h;
    }

    getSmallestDie() : Hand
    {
        let smallestDie = null;
        let smallestSize = Infinity;
        for(const die of this.dice)
        {
            const size = die.count();
            if(size >= smallestSize) { continue; }
            smallestSize = size;
            smallestDie = die;
        }
        return smallestDie;
    }
}