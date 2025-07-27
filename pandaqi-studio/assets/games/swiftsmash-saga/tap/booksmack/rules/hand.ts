import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
    
    getWinner() : Card
    {
        const cards = this.cards.slice().filter((card) => card instanceof Card);
        cards.sort((a:Card, b:Card) => {
            const rankAlphabetA = ALPHABET.indexOf(a.symbol.toUpperCase());
            const rankAlphabetB = ALPHABET.indexOf(b.symbol.toUpperCase());
            if(rankAlphabetA != rankAlphabetB) { return rankAlphabetB - rankAlphabetA; } // it's LATEST position in alphabet
            
            const isUppercaseA = a.symbol.toUpperCase() == a.symbol;
            return isUppercaseA ? 1 : -1; // a value of 1 means "we're good", a value of -1 means "flip the numbers"
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