import { fromArray } from "lib/pq-games";
import CONFIG from "../shared/config";
import { CardMovement, CardType, MOVEMENT_CARDS, MOVEMENT_SPECIAL } from "../shared/dict";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        
        this.generateBaseCards();
        this.generateUnclearInstructions();

        console.log(this.cards);
    }

    generateBaseCards()
    {
        if(!CONFIG.sets.base) { return; }

        this.generateMovementCards(CONFIG.generation.movementCardNumBase, CONFIG.generation.movementCardDistBase);
    }

    generateUnclearInstructions()
    {
        if(!CONFIG.sets.unclearInstructions) { return; }

        this.generateMovementCards(CONFIG.generation.movementCardNumUnclear, CONFIG.generation.movementCardDistUnclear, true);
    }

    generateMovementCards(targetNum:number, dist:Record<CardMovement, number>, addSpecial:boolean = false)
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
                this.cards.push(newCard);
            }
        }
    }
}