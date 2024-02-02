import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import { MISC, VEHICLE_CARDS } from "../js_shared/dict";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";

export default class Card extends MaterialNaivigation
{
    getData() { return VEHICLE_CARDS[this.key]; }
    getMisc() { return MISC; }
    async draw(vis)
    {
        return cardDrawerNaivigation(vis, this);
    }
}