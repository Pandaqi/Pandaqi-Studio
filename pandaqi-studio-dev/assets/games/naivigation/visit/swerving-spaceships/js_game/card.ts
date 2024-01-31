import { CardType } from "games/naivigation/js_shared/dictShared";
import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import { MISC, VEHICLE_CARDS } from "../js_shared/dict";

export default class Card
{
    type: CardType
    key: string
    customData:Record<string,any>;

    constructor(t:CardType, k:string = "")
    {
        this.type = t;
        this.key = k;
    }

    getData() { return VEHICLE_CARDS[this.key]; }
    getMisc() { return MISC; }
    async draw(vis)
    {
        return cardDrawerNaivigation(vis, this);
    }
}