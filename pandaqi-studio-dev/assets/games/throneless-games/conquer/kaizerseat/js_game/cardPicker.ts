import generatePacks from "games/throneless-games/js_shared/generatePacks";
import CONFIG from "../js_shared/config";
import { PACKS, SETS } from "../js_shared/dict";
import CardThroneless from "games/throneless-games/js_shared/cardThroneless";

export default class CardPicker
{
    cards: CardThroneless[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];
        generatePacks(this.cards, CONFIG, PACKS, SETS);
        console.log(this.cards);
    }
}