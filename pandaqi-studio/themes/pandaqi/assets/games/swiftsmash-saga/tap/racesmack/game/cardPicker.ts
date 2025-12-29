
import { shuffle, fromArray, getWeighted } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CardDisplayType, CardType, ColorType, FINISH_REQUIREMENTS, RULE_CARDS, ShapeType } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    
    generateBaseCards(cards);
    generateSpecialCards(cards);

    return cards;
}

const generateBaseCards = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }

    generateRegularCards(cards, "base");
    generateRulesCards(cards, "base");
}

const generateSpecialCards = (cards) =>
{
    if(!CONFIG._settings.sets.shiftingGears.value) { return; }

    generateRegularCards(cards, "shiftingGears");
}

const generateRegularCards = (cards, set:string) =>
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
        cards.push(newCard);
    }
}

const generateRulesCards = (cards, set) =>
{
    const num : number = CONFIG.generation.numRulesCardsPerSet[set];
    for(let i = 0; i < num; i++)
    {
        const action = getWeighted(RULE_CARDS);
        const finishReq = getWeighted(FINISH_REQUIREMENTS);
        const newCard = new Card(CardType.RULE);
        newCard.setRuleProperties(action, finishReq);
        newCard.uniqueNumber = (i+1);
        cards.push(newCard);
    }
}