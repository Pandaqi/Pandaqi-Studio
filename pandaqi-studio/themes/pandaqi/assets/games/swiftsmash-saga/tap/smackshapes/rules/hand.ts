
import { shuffle, convertCanvasToImageMultiple } from "lib/pq-games";
import { InteractiveExampleSimulator } from "lib/pq-rulebook";
import Card from "../game/card";

export default class Hand
{
    cards: Card[] = []

    getCards() { return this.cards.slice(); }
    count() { return this.cards.length; }
    addCard(c:Card) { this.cards.push(c); return this; }
    addHand(h:Hand) { this.addCards(h.cards); }
    addCards(cards:Card[])
    {
        for(const card of cards) { this.addCard(card); }
        return this;
    }

    getFirst() { return this.cards[0]; }
    getLast() { return this.cards[this.count() - 1]; }

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
        if(idx < 0) { return null; }
        return this.cards.splice(idx,1)[0];
    }

    removeCard(c:Card) : Card
    {
        const idx = this.cards.indexOf(c);
        return this.removeCardAtIndex(idx);
    }

    removeCards(cards:Card[]) 
    {
        for(const card of cards) { this.removeCard(card); }
    }
    
    getWinner(smackheadCard:Card) : Card
    {
        const ranking = smackheadCard.ranking.slice();
        const cards = this.cards.slice();
        cards.sort((a:Card, b:Card) => {
            const rankIdxA = ranking.indexOf(a.shape);
            const rankIdxB = ranking.indexOf(b.shape);
            if(rankIdxA != rankIdxB) { return rankIdxA - rankIdxB; } // it's LEAST position in ranking
            return b.number - a.number; // it's MOST icons
        })
        return cards[0];
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const card of this.cards)
        {
            if(!card) { continue; }
            canvases.push(await card.draw(sim.getVisualizer()));
        }
        return convertCanvasToImageMultiple(canvases);
    }
}