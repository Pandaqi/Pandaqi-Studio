import CONFIG from "../js_shared/config";
import { CardType, MATERIAL, MaterialClass, TokenType } from "../js_shared/dict";
import Card from "./card";
import Token from "./token";

export default class CardPicker
{
    cards: MaterialClass[]

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

    generateFromDictionary(inputType:CardType, cardType:CardType = null)
    {
        if(!cardType) { cardType = inputType; }
        if(!inputType) { inputType = cardType; }

        for(const [key,data] of Object.entries(MATERIAL[inputType]))
        {
            const reqs = data.required ?? [];
            for(const requirement of reqs)
            {
                if(!CONFIG[requirement]) { continue; }
            }

            const freq = data.freq ?? 1;
            for(let i = 0; i < freq; i++)
            {
                const newCard = new Card(cardType, key);
                this.cards.push(newCard);
            }
        }
    }

    generateInstructionTokens()
    {
        if(!CONFIG.includeInstructionTokens) { return; }

        // we use a trick here to push 2/3 tokens on ONE card, to fold it into this system and ensure it has the same dimensions as the cards you play with
        for(let i = 0; i < 5; i++)
        {
            const newToken = new Token(TokenType.INSTRUCTION);
            newToken.customData = { num: (i + 1) };
            this.cards.push(newToken);
        }

        // sort of the same for the compass
        const compassCard = new Card(CardType.COMPASS);
        this.cards.push(compassCard);
    }

    generateVehicleCards()
    {
        if(!CONFIG.includeVehicleCards) { return; }
        this.generateFromDictionary(CardType.VEHICLE);
    }

    generateHealthCards()
    {
        if(!CONFIG.includeHealthCards) { return; }
        this.generateFromDictionary(CardType.HEALTH);
    }

    generateGPSCards()
    {
        if(!CONFIG.includeGPSCards) { return; }
        
        const num = CONFIG.cards.generation.numGPSCards;

        // @TODO: Generate these cards
        // => create random grid, where some squares are green and some are rad
        // => attach random bonus/penalty from MATERIAL[CardType.GPS]
        // => save those as cards
    }

    generateTimeDeck()
    {
        if(!CONFIG.includeTimeDeck) { return; }
        this.generateFromDictionary(CardType.TIME);
    }

    generateFuelDeck()
    {
        if(!CONFIG.includeFuelDeck) { return; }

        // add the actual fuel trackers
        const num = CONFIG.cards.generation.numFuelCards;
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(CardType.FUEL);
        }

        // add the vehicle cards to use during play
        this.generateFromDictionary(CardType.FUEL, CardType.VEHICLE);
    }
}