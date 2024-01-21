import CONFIG from "../js_shared/config";
import Card from "./card";

export default class CardPicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards; }
    async generate()
    {
        this.cards = [];

        this.generateInstructionTokens();
        this.generateVehicleCards();
        this.generateHealthCards();
        this.generateGPSCards();
        this.generateTimeDeck();
        this.generateFuelDeck();
    }

    generateInstructionTokens()
    {
        if(!CONFIG.includeInstructionTokens) { return; }

        // @TODO: place 2 of the same on the same "card"; this simplifies material generation without wasting space
        // They must be equally wide as the cards anyway

        // @TODO: Also include the COMPASS (maybe multiple) here! It's the most associated category and I don't want to make it a standalone script/page
    }

    generateVehicleCards()
    {
        if(!CONFIG.includeVehicleCards) { return; }

        // @TODO
    }

    generateHealthCards()
    {
        if(!CONFIG.includeHealthCards) { return; }

        // @TODO
    }

    generateGPSCards()
    {
        if(!CONFIG.includeGPSCards) { return; }

        // @TODO
    }

    generateTimeDeck()
    {
        if(!CONFIG.includeTimeDeck) { return; }

        // @TODO
    }

    generateFuelDeck()
    {
        if(!CONFIG.includeFuelDeck) { return; }

        // @TODO
    }
}