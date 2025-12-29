import { CONFIG } from "../shared/config";
import { GPS_PENALTIES, GPS_REWARDS, MATERIAL } from "../shared/dict";
import { CardType } from "../shared/dictShared";
import pickNavigationCards from "../shared/pickNavigationCards";
import Card from "./card";


export const cardPicker = () : Card[] =>
{
    const cards = [];

    generateInstructionTokens(cards);
    generateVehicleCards(cards);
    generateHealthCards(cards);
    generateActionCards(cards);
    generateGPSCards(cards);
    generateTimeDeck(cards);

    return cards;
}

const generateFromDictionary = (cards, inputType:CardType, cardType:CardType = null) =>
{
    if(!cardType) { cardType = inputType; }
    if(!inputType) { inputType = cardType; }

    for(const [key,data] of Object.entries(MATERIAL[inputType]))
    {
        const reqs = data.required ?? [];
        for(const requirement of reqs)
        {
            if(!CONFIG._settings.sets[requirement].value) { continue; }
        }

        const freq = data.freq ?? 1;
        for(let i = 0; i < freq; i++)
        {
            const newCard = new Card(cardType, key);
            cards.push(newCard);
        }
    }
}

const generateInstructionTokens = (cards) =>
{
    if(!CONFIG._settings.sets.instructionTokens.value) { return; }

    // we use a trick here to push 2 tokens on ONE card, to fold it into this system and ensure it has the same dimensions as the cards you play with
    const num = CONFIG.cards.generation.numInstructionTokens;
    for(let i = 0; i < num; i++)
    {
        const newToken = new Card(CardType.INSTRUCTION);
        newToken.customData = { num: (i + 1) };
        cards.push(newToken);
    }

    // sort of the same for the compass
    const compassCard = new Card(CardType.COMPASS);
    cards.push(compassCard);
}

const generateActionCards = (cards) =>
{
    if(!CONFIG._settings.sets.actionCards.value) { return; }
    generateFromDictionary(cards, CardType.ACTION);
}

const generateVehicleCards = (cards) =>
{
    if(!CONFIG._settings.sets.vehicleCards.value) { return; }
    generateFromDictionary(cards, CardType.VEHICLE);
}

const generateHealthCards = (cards) =>
{
    if(!CONFIG._settings.sets.healthCards.value) { return; }
    generateFromDictionary(cards, CardType.HEALTH);
}

const generateGPSCards = (cards) =>
{
    if(!CONFIG._settings.sets.GPSCards.value) { return; }
    
    const params = {
        num: CONFIG.cards.generation.numGPSCards,
        single: CONFIG.cards.generation.percentageSingleGPS,
        rewardDict: GPS_REWARDS,
        penaltyDict: GPS_PENALTIES,
        cardClass: Card
    }

    const cardsGPS = pickNavigationCards(params);
    for(const card of cardsGPS)
    {
        cards.push(card);
    }
}

const generateTimeDeck = (cards) =>
{
    if(!CONFIG._settings.sets.timeCards.value) { return; }
    generateFromDictionary(cards, CardType.TIME);
}

/*
generateFuelDeck()
{
    if(!CONFIG._settings.sets.fuelDeck.value) { return; }

    // add the actual fuel trackers
    const num = CONFIG.cards.generation.numFuelCards;
    for(let i = 0; i < num; i++)
    {
        const newCard = new Card(CardType.FUEL);
    }

    // add the vehicle cards to use during play
    generateFromDictionary(CardType.FUEL, CardType.VEHICLE);
}
*/