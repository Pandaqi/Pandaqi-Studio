import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Card from "../game/card";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import Board from "./board";
import ContractValidator from "./contractValidator";

export default class Player
{
    num = -1
    cards: Card[] = []
    contracts: Card[] = []
    contractSuccess: boolean[] = []

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

    addContract(c:Card) { this.contracts.push(c); }
    countContracts() { return this.contracts.length; }
    getLastContract()
    {
        return this.contracts[this.contracts.length - 1];
    }
    
    removeCardRandom() 
    { 
        const randIdx = Math.floor(Math.random() * this.count());
        return this.removeCardAtIndex(randIdx); 
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

    validateContract(b:Board) : boolean
    {
        const lastContract = this.getLastContract();
        if(!lastContract) { this.contractSuccess.push(false); return false; }

        const validator = new ContractValidator();
        const success = validator.validate(lastContract, b);

        this.contractSuccess.push(success);
        return success;
    }

    scoreContracts() : number
    {
        let num = 0;
        for(let i = 0; i < this.countContracts(); i++)
        {
            const contract = this.contracts[i];
            const success = this.contractSuccess[i];
            if(!contract) { continue; }
            num += contract.getScore(success);
        }
        return num;
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