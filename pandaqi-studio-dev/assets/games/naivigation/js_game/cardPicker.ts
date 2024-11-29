import CONFIG from "../js_shared/config";
import { GPS_PENALTIES, GPS_REWARDS, MATERIAL } from "../js_shared/dict";
import { CardType } from "../js_shared/dictShared";
import MaterialNaivigation from "../js_shared/materialNaivigation";
import pickNavigationCards from "../js_shared/pickNavigationCards";
import Card from "./card";


export default class CardPicker
{
    cards: MaterialNaivigation[]

    constructor() {}
    get() { return this.cards; }
    async generate()
    {
        this.cards = [];

        this.generateInstructionTokens();
        this.generateVehicleCards();
        this.generateHealthCards();
        this.generateActionCards();
        this.generateGPSCards();
        this.generateTimeDeck();

        console.log(this.cards);
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
                if(!CONFIG.sets[requirement]) { continue; }
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
        if(!CONFIG.sets.instructionTokens) { return; }

        // we use a trick here to push 2 tokens on ONE card, to fold it into this system and ensure it has the same dimensions as the cards you play with
        const num = CONFIG.cards.generation.numInstructionTokens;
        for(let i = 0; i < num; i++)
        {
            const newToken = new Card(CardType.INSTRUCTION);
            newToken.customData = { num: (i + 1) };
            this.cards.push(newToken);
        }

        // sort of the same for the compass
        const compassCard = new Card(CardType.COMPASS);
        this.cards.push(compassCard);
    }

    generateActionCards()
    {
        if(!CONFIG.sets.actionCards) { return; }
        this.generateFromDictionary(CardType.ACTION);
    }

    generateVehicleCards()
    {
        if(!CONFIG.sets.vehicleCards) { return; }
        this.generateFromDictionary(CardType.VEHICLE);
    }

    generateHealthCards()
    {
        if(!CONFIG.sets.healthCards) { return; }
        this.generateFromDictionary(CardType.HEALTH);
    }

    generateGPSCards()
    {
        if(!CONFIG.sets.GPSCards) { return; }
        
        const params = {
            num: CONFIG.cards.generation.numGPSCards,
            single: CONFIG.cards.generation.percentageSingleGPS,
            rewardDict: GPS_REWARDS,
            penaltyDict: GPS_PENALTIES,
            cardClass: Card
        }

        const cards = pickNavigationCards(params);
        for(const card of cards)
        {
            this.cards.push(card);
        }
    }

    generateTimeDeck()
    {
        if(!CONFIG.sets.timeDeck) { return; }
        this.generateFromDictionary(CardType.TIME);
    }

    /*
    generateFuelDeck()
    {
        if(!CONFIG.sets.fuelDeck) { return; }

        // add the actual fuel trackers
        const num = CONFIG.cards.generation.numFuelCards;
        for(let i = 0; i < num; i++)
        {
            const newCard = new Card(CardType.FUEL);
        }

        // add the vehicle cards to use during play
        this.generateFromDictionary(CardType.FUEL, CardType.VEHICLE);
    }
    */
}