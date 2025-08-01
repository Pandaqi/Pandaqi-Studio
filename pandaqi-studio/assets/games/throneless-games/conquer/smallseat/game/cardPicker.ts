import generatePacks from "games/throneless-games/shared/generatePacks";
import { CONFIG } from "../shared/config";
import { PACKS, SETS } from "../shared/dict";
import CardThroneless from "games/throneless-games/shared/cardThroneless";
import cacheDefaultData from "games/throneless-games/shared/cacheDefaultData";

export default class CardPicker
{
    cards: CardThroneless[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];
        cacheDefaultData(PACKS);
        generatePacks(this.cards, CONFIG, PACKS, SETS);
    }
}