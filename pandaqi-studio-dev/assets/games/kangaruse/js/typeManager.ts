import { CELLS } from "./dictionary";
import CONFIG from "./config"
import BalancedDictionaryPicker from "js/pq_games/tools/generation/balancedDictionaryPicker";

export default class TypeManager
{
    game: any
    picker: BalancedDictionaryPicker

    constructor(game:any) 
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

    getFullTypeList(num:number)
    {
        return this.picker.getFullTypeList(num);
    }
}