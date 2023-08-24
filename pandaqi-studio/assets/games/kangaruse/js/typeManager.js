import Type from "./type";
import { CELLS } from "./dictionary";
import Random from "js/pq_games/tools/random/main";

export default class TypeManager
{
    constructor(game) 
    {
        this.game = game;
        this.cfg = this.game.cfg;
        this.cfgTypes = this.cfg.types;

        this.drawRandomTypes();
    }
    
    getTypeData(typeObject)
    {
        return CELLS[typeObject.type];
    }

    drawRandomTypes()
    {
        this.types = [];
        // @TODO
    }

    removeType(dictKey, type)
    {
        for(let i = this.types.length-1; i >= 0; i--)
        {
            const obj = this.types[i];
            if(obj[dictKey] != type) { continue; }
            this.types.splice(i, 1);
        }
    }
}