import CONFIG from "../js_shared/config";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }

    generate()
    {
        this.cards = [];

        for(const [suit,shouldInclude] of Object.entries(CONFIG.suits))
        {
            if(!shouldInclude) { continue; }
            this.generateSuit(suit);
        }

        this.assignPowers();
    }

    generateSuit(suit:string)
    {
        const numbers = CONFIG.generation.numbers;
        const cardsPerNumber = CONFIG.generation.cardsPerNumber;
        for(const num of numbers)
        {
            for(let i = 0; i < cardsPerNumber; i++)
            {
                const card = new Card(suit, num);
                this.cards.push(card);
            }
            
        }
    }

    assignPowers()
    {

    }
}