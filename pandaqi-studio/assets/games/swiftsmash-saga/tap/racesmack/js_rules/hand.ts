import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../js_game/card";
import Player from "./player";
import CONFIG from "../js_shared/config";
import { CardType, ShapeType } from "../js_shared/dict";
import RulesTracker from "./rulesTracker";

export default class Hand
{
    cards: Card[] = []
    pointers: Player[] = []

    addPointer(p:Player) { this.pointers.push(p); }

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

    isCardCorrect(cardTarget:Card) : boolean
    {
        // check the default rule
        const rt = new RulesTracker();

        // handle any shenanigans by rule cards
        const ruleCard = this.getActiveRuleCard();
        if(!ruleCard) { return rt.isCorrectDefault(cardTarget, this.cards); }
        return rt.isCorrect(ruleCard, cardTarget, this.cards);
    }

    getActiveRuleCard()
    {
        const ruleCards = this.cards.filter((c:Card) => c.type == CardType.RULE);
        const ruleHandling = CONFIG.rulebook.ruleCardHandling ?? "ignore";
        if(ruleHandling == "ignore") { 
            return null;
        } else if(ruleHandling == "one") {
            if(ruleCards.length != 1) { return null; }
            return ruleCards[0];
        } else if (ruleHandling == "highest") {
            if(ruleCards.length <= 0) { return null; }
            const highestRule = ruleCards.sort((a:Card, b:Card) => b.uniqueNumber - a.uniqueNumber)[0];
            return highestRule;
        }
        return null;
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