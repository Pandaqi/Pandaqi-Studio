import { shuffle, convertCanvasToImageMultiple } from "lib/pq-games";
import { InteractiveExampleSimulator } from "lib/pq-rulebook";
import Card from "../game/card";

export default class Hand
{
    cards: Card[] = []

    getCards() { return this.cards.slice(); }
    count() { return this.cards.length; }
    addCard(c:Card) { this.cards.push(c); }
    addHand(h:Hand) { this.addCards(h.cards); }
    addCards(cards:Card[])
    {
        for(const card of cards) { this.addCard(card); }
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

    getNumberTypes() { return Object.keys(this.getNumberFreqs()).map((x) => parseInt(x)); }
    getNumberFreqs()
    {
        const freqs:Record<number, number> = {};
        for(const card of this.cards)
        {
            freqs[card.num] = (freqs[card.num] ?? 0) + 1;
        }
        return freqs;
    }

    getSuitTypes() { return Object.keys(this.getSuitFreqs()); }
    getSuitFreqs()
    {
        const freqs:Record<string, number> = {};
        for(const card of this.cards)
        {
            freqs[card.suit] = (freqs[card.suit] ?? 0) + 1;
        }
        return freqs;
    }

    getSuitsForNumber(num:number) : string[]
    {
        const set : Set<string> = new Set();
        for(const card of this.cards)
        {
            if(card.num != num) { continue; }
            set.add(card.suit);
        }

        return Array.from(set);
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