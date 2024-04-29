import generatePacks from "games/throneless-games/js_shared/generatePacks";
import CONFIG from "../js_shared/config";
import { PACKS, SETS } from "../js_shared/dict";
import CardThroneless from "games/throneless-games/js_shared/cardThroneless";
import cacheDefaultData from "games/throneless-games/js_shared/cacheDefaultData";

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