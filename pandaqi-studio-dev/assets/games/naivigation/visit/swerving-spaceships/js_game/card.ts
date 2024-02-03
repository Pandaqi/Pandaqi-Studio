import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import { MAIN_COLORS, MISC, VEHICLE_CARDS } from "../js_shared/dict";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";

export default class Card extends MaterialNaivigation
{
    getGameData() { return MAIN_COLORS; }
    getData() { return VEHICLE_CARDS[this.key]; }
    getMisc() { return MISC; }
    async draw(vis)
    {
        return cardDrawerNaivigation(vis, this);
    }
}