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
            if(!CONFIG.sets[requirement]) { continue; }
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
    if(!CONFIG.sets.instructionTokens) { return; }

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
    if(!CONFIG.sets.actionCards) { return; }
    generateFromDictionary(cards, CardType.ACTION);
}

const generateVehicleCards = (cards) =>
{
    if(!CONFIG.sets.vehicleCards) { return; }
    generateFromDictionary(cards, CardType.VEHICLE);
}

const generateHealthCards = (cards) =>
{
    if(!CONFIG.sets.healthCards) { return; }
    generateFromDictionary(cards, CardType.HEALTH);
}

const generateGPSCards = (cards) =>
{
    if(!CONFIG.sets.GPSCards) { return; }
    
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
    if(!CONFIG.sets.timeCards) { return; }
    generateFromDictionary(cards, CardType.TIME);
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
    generateFromDictionary(CardType.FUEL, CardType.VEHICLE);
}
*/