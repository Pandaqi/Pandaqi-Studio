import generatePacks from "games/throneless-games/shared/generatePacks";
import { CONFIG } from "../shared/config";
import { PACKS, SEAT_CARDS, SETS, THRONE_CARDS } from "../shared/dict";
import CardThroneless from "games/throneless-games/shared/cardThroneless";
import cacheDefaultData from "games/throneless-games/shared/cacheDefaultData";
import { CardType } from "games/throneless-games/shared/dictShared";
import { getSetting } from "lib/pq-games";

export const cardPicker = () : CardThroneless[] => 
{
    const cards = [];
    cacheDefaultData(PACKS);
    generatePacks(cards, CONFIG, PACKS, SETS);
    generateThroneCards(cards);
    generateSeatCards(cards);
    return cards;
}

const generateThroneCards = (cards) =>
{
    if(!getSetting("generateThroneCards", CONFIG)) { return; }

    for(const data of THRONE_CARDS)
    {
        const obj = { action: { text: data } }
        const newCard = new CardThroneless(CardType.THRONE, "throne", obj);
        cards.push(newCard);
    }
}

const generateSeatCards = (cards) =>
{
    if(!getSetting("generateSeatCards", CONFIG)) { return; }

    for(const data of SEAT_CARDS)
    {
        const obj = { action: { text: data } }
        const newCard = new CardThroneless(CardType.SEAT, "seat", obj);
        cards.push(newCard);
    }
}