import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "../js_shared/config";
import { CardMovement, CardType, MOVEMENT_SPECIAL } from "../js_shared/dict";
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
        this.generatePawns();
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
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(CardType.MOVEMENT);
                newCard.typeMovement = key as CardMovement;
                newCard.specialAction = addSpecial ? fromArray(possibleActions) : "";
                this.cards.push(newCard);
            }
        }
    }

    generatePawns()
    {
        // @NOTE: two pawns per card, hence 3
        for(let i = 0; i < 3; i++)
        {
            const newCard = new Card(CardType.PAWN);
            newCard.pawnIndex = i;
            this.cards.push(newCard);
        }
    }
}