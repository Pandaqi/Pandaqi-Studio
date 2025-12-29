import { fromArray } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { CardMovement, CardType, MOVEMENT_CARDS, MOVEMENT_SPECIAL } from "../shared/dict";
import Card from "./card";

export const cardPicker = () : Card[] =>
{
    const cards = [];
    
    generateBaseCards(cards);
    generateUnclearInstructions(cards);

    return cards;
}

const generateBaseCards = (cards) =>
{
    if(!CONFIG._settings.sets.base.value) { return; }
    generateMovementCards(cards, CONFIG.generation.movementCardNumBase, CONFIG.generation.movementCardDistBase);
}

const generateUnclearInstructions = (cards) =>
{
    if(!CONFIG._settings.sets.unclearInstructions.value) { return; }
    generateMovementCards(cards, CONFIG.generation.movementCardNumUnclear, CONFIG.generation.movementCardDistUnclear, true);
}

const generateMovementCards = (cards:Card[], targetNum:number, dist:Record<CardMovement, number>, addSpecial:boolean = false) =>
{
    const possibleActions = Object.keys(MOVEMENT_SPECIAL);
    for(const [key,freqRaw] of Object.entries(dist))
    {
        const freq = Math.ceil(freqRaw * targetNum);
        const data = MOVEMENT_CARDS[key];
        for(let i = 0; i < freq; i++)
        {
            const newCard = new Card(CardType.MOVEMENT);
            newCard.typeMovement = key as CardMovement;
            newCard.specialAction = (addSpecial && data.canHaveSpecial) ? fromArray(possibleActions) : "";
            cards.push(newCard);
        }
    }
    return cards;
}