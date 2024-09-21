import fromArray from "js/pq_games/tools/random/fromArray";
import Card from "../js_game/card";
import CONFIG from "../js_shared/config";
import PowerChecker from "./powerChecker";
import { getIndexOfProp } from "./queries";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";

export default class Round
{
    cards: Card[]
    checker: PowerChecker

    constructor(cards = [])
    {
        this.cards = cards;
        this.checker = new PowerChecker();
    }

    count() { return this.cards.length; }
    addCard(c:Card) { this.cards.push(c); return this; }
    addCards(cards:Card[]) { for(const card of cards) { this.addCard(card); } return this; }

    async draw(sim:InteractiveExampleSimulator)
    {
        const arr = [];
        for(const card of this.cards)
        {
            arr.push(card.drawForRules(sim.visualizer));
        }
        return await Promise.all(arr);
    }

    hasDuplicateNumbers()
    {
        for(let i = 0; i < this.cards.length; i++)
        {
            const card = this.cards[i];
            const idx = getIndexOfProp(this.cards, "num", card.num);
            if(idx != i) { return true; }
        }
        return false;
    }

    getPoisonedFood()
    {
        const trueCards = this.getTrueCards();
        const highest = this.getHighest(trueCards);
        return highest;
    }

    getTrueCards()
    {
        return this.checker.getTrueCards(this.cards.slice());
    }

    getHighest(list:Card[])
    {
        const highestNum = Math.max(...list.map(o => o.num));
        const arr = [];
        for(const elem of list)
        {
            if(elem.num != highestNum) { continue; }
            arr.push(elem);
        }
        return arr;
    }
}