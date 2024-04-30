import generatePacks from "games/throneless-games/js_shared/generatePacks";
import CONFIG from "../js_shared/config";
import { PACKS, SEAT_CARDS, SETS, THRONE_CARDS } from "../js_shared/dict";
import CardThroneless from "games/throneless-games/js_shared/cardThroneless";
import cacheDefaultData from "games/throneless-games/js_shared/cacheDefaultData";
import { CardType } from "games/throneless-games/js_shared/dictShared";

export default class CardPicker
{
    cards: CardThroneless[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];
        cacheDefaultData(PACKS);
        generatePacks(this.cards, CONFIG, PACKS, SETS);

        this.generateThroneCards();
        this.generateSeatCards();
    }

    generateThroneCards()
    {
        for(const data of THRONE_CARDS)
        {
            const newCard = new CardThroneless(CardType.THRONE, "", { text: data });
            this.cards.push(newCard);
        }
    }

    generateSeatCards()
    {
        for(const data of SEAT_CARDS)
        {
            const newCard = new CardThroneless(CardType.SEAT, "", { text: data });
            this.cards.push(newCard);
        }
    }
}