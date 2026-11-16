import { BalancedDictionaryPicker, getSetting } from "lib/pq-games";
import { CELLS } from "../shared/dict";
import { CONFIG } from "./config"

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
        const bounds = CONFIG.generation.types.numUniqueTypes;
        this.picker.setMinOfProperties([{ prop: "score", num: CONFIG.generation.minScoreTypes }]);
        this.picker.setMaxOfProperties([{ prop: "score", num: CONFIG.generation.maxScoreTypes }]);
        this.picker.pickPossibleTypes(CONFIG, bounds);
        if(getSetting("startingPositions", CONFIG)) { this.picker.addPossibleTypeForced("starting_position"); }
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