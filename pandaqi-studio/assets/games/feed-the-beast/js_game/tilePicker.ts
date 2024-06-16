import CONFIG from "../js_shared/config";
import { BEASTS, MaterialType } from "../js_shared/dict";
import Card from "./card";

export default class TilePicker
{
    cards: Card[]

    constructor() {}
    get() { return this.cards.slice(); }
    async generate()
    {
        this.cards = [];
        for(const [key,data] of Object.entries(BEASTS))
        {
            const set = data.set ?? "baseBeasts";
            if(!CONFIG.sets[set]) { continue; }
            this.cards.push(new Card(MaterialType.BEAST, key));
        }
        console.log(this.cards);
    }
}