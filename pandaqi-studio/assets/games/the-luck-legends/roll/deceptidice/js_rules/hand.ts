import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../js_game/card";
import { GuessTarget } from "./guess";

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

    removeCards(cards:Card[]) 
    {
        for(const card of cards) { this.removeCard(card); }
    }

    getFrequencies(target:GuessTarget) : Record<any, number>
    {
        const freqs = {};
        for(const card of this.cards)
        {
            if(target == GuessTarget.COLOR) {
                freqs[card.suit] = (freqs[card.suit] ?? 0) + 1;
            } else {
                freqs[card.num] = (freqs[card.num] ?? 0) + 1;
            }
        }
        return freqs;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const card of this.cards)
        {
            canvases.push(await card.drawForRules(sim.getVisualizer()));
        }
        return convertCanvasToImageMultiple(canvases);
    }
}