import cardDrawerNaivigation from "games/naivigation/js_shared/cardDrawerNaivigation";
import MaterialNaivigation from "games/naivigation/js_shared/materialNaivigation";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { GAME_DATA, MATERIAL, MISC } from "../js_shared/dict";

export default class Card extends MaterialNaivigation
{
    getGameData() { return GAME_DATA; }
    getData() { return MATERIAL[this.type][this.key]; }
    getMisc() { return MISC; }
    async draw(vis:MaterialVisualizer)
    {
        // @TODO: special passenger cards
        return cardDrawerNaivigation(vis, this);
    }
}