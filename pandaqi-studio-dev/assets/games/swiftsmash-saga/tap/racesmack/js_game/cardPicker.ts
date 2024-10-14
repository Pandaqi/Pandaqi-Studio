import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { CardDisplayType, CardType, ColorType, FINISH_REQUIREMENTS, RULE_CARDS, ShapeType } from "../js_shared/dict";
import Card from "./card";
import fromArray from "js/pq_games/tools/random/fromArray";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        this.generateBaseCards();
        this.generateSpecialCards();

        console.log(this.cards);
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        this.generateRegularCards("base");
        this.generateRulesCards("base");
    }

    generateSpecialCards()
    {
        if(!CONFIG.sets.shiftingGears) { return; }

        this.generateRegularCards("shiftingGears");
    }

    generateRegularCards(set:string)
    {
        const numCards : number = CONFIG.generation.numCardsPerSet[set];

        // determine the symbols we need (exact quantities and types)
        let totalNumSymbols = 0;
        const numbersFinal = [];
        const dist : Record<number, number> = CONFIG.generation.numSymbolsDist;
        for(const [num,freqRaw] of Object.entries(dist))
        {
            const freq = Math.ceil(freqRaw * numCards);
            totalNumSymbols += freq * parseInt(num);
            for(let i = 0; i < freq; i++)
            {
                numbersFinal.push(num);
            }
        }
        shuffle(numbersFinal);

        const shapesPossible = Object.values(ShapeType);
        const numShapes = shapesPossible.length;
        const shapeFreq = 1.0 / numShapes;
        const shapesFinal = [];
        for(const shape of shapesPossible)
        {
            const freq = Math.ceil(shapeFreq * totalNumSymbols);
            for(let i = 0; i < freq; i++)
            {
                shapesFinal.push(shape);
            }
        }
        shuffle(shapesFinal);

        // determine the colors (every shape has its own color)
        const colorsFinal = [];
        const colorDist : Record<ColorType, number> = CONFIG.generation.colorDist;
        for(const [color,freqRaw] of Object.entries(colorDist))
        {
            const freq = Math.ceil(freqRaw * shapesFinal.length);
            for(let i = 0; i < freq; i++)
            {
                colorsFinal.push(color);
            }
        }
        shuffle(colorsFinal);
        
        // create them all from the fairly generated data
        const displayTypesAllowed : CardDisplayType[] = CONFIG.generation.displayTypesPerSet[set];
        for(let i = 0; i < numCards; i++)
        {
            const dt = fromArray(displayTypesAllowed);
            const num = numbersFinal.pop();
            const colors = colorsFinal.splice(0, num);
            const symbols = shapesFinal.splice(0, num);
            const newCard = new Card(CardType.REGULAR);
            newCard.setRegularProperties(dt, symbols, colors);
            this.cards.push(newCard);
        }
    }

    generateRulesCards(set)
    {
        const num : number = CONFIG.generation.numRulesCardsPerSet[set];
        for(let i = 0; i < num; i++)
        {
            const action = getWeighted(RULE_CARDS);
            const finishReq = getWeighted(FINISH_REQUIREMENTS);
            const newCard = new Card(CardType.RULE);
            newCard.setRuleProperties(action, finishReq);
            newCard.uniqueNumber = (i+1);
            this.cards.push(newCard);
        }
    }
}