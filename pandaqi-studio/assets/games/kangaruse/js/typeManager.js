import { CELLS, CONFIG } from "./dictionary";
import BalancedDictionaryPicker from "js/pq_games/tools/generation/balancedDictionaryPicker";

export default class TypeManager
{
    constructor(game) 
    {
        this.game = game;
        this.picker = new BalancedDictionaryPicker(CELLS);
    }
    
    drawRandomTypes()
    {
        const bounds = CONFIG.types.numUniqueTypes;
        this.picker.setRequiredProperties([{ prop: "score", num: 2 }]);
        this.picker.pickPossibleTypes(CONFIG, bounds);

        console.log(this.picker);

        if(CONFIG.startingPositions) { this.picker.addPossibleTypeForced("starting_position"); }
    }

    getPossibleTypes()
    {
        return this.picker.getPossibleTypes();
    }

    getFullTypeList(num)
    {
        const list = this.picker.getFullTypeList(num);
        return list;
    }
}