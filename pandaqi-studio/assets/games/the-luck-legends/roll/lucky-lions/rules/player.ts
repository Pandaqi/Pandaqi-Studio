import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class Player
{
    num = -1
    cards: Card[] = []

    constructor(n:number)
    {
        this.num = n;
    }

    getCards() { return this.cards.slice(); }
    count() { return this.cards.length; }
    addCard(c:Card) { this.cards.push(c); }
    addCards(cards:Card[])
    {
        for(const card of cards) { this.addCard(card); }
    }

    getCardRandom(maxNum:number = this.count())
    {
        const subList = shuffle(this.cards.slice());
        maxNum = Math.min(maxNum, subList.length);
        return subList[Math.floor(Math.random() * maxNum)];
    }
    
    removeCardRandom() 
    { 
        return this.removeCard(this.getCardRandom());
    }

    removeCardAtIndex(idx:number)
    {
        if(idx < 0) { return; }
        return this.cards.splice(idx,1)[0];
    }

    removeCard(c:Card) : Card
    {
        const idx = this.cards.indexOf(c);
        return this.removeCardAtIndex(idx);
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const card of this.cards)
        {
            canvases.push(await card.draw(sim.getVisualizer()));
        }
        return convertCanvasToImageMultiple(canvases);
    }
}