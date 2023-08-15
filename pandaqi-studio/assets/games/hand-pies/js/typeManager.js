import Type from "./type";
import { MAIN_TYPES, INGREDIENTS, MACHINES, MONEY, TUTORIAL } from "./dictionary";
import Random from "js/pq_games/tools/random/main";

export default class TypeManager
{
    constructor(game) 
    {
        this.game = game;
        this.cfg = this.game.cfg;
        this.cfgTypes = this.cfg.types;

        this.counters = {
            mainType: {},
            subType: {}
        }

        this.drawRandomTypes();
    }

    drawRandomTypes()
    {
        const machineBounds = this.cfgTypes.machineBounds;
        const numMachines = Random.rangeInteger(machineBounds.min, machineBounds.max);

        this.types = [];

        // NOTE: tutorial and money are handled separately (not part of type list)
        // get ingredients
        const ingredientBounds = this.cfgTypes.ingredientBounds;
        const numIngredients = Random.rangeInteger(ingredientBounds.min, ingredientBounds.max);
        const ingDict = structuredClone(INGREDIENTS);
        for(let i = 0; i < numIngredients; i++)
        {
            const type = Random.getWeighted(ingDict, "prob");
            delete ingDict[type];
            this.types.push(new Type("ingredient", type));
        }
        
        // get machines (if applicable)
        if(this.cfg.expansions.machines)
        {
            const machineBounds = this.cfgTypes.machineBounds;
            const numMachines = Random.rangeInteger(machineBounds.min, machineBounds.max);
            const machineDict = structuredClone(MACHINES);
            for(let i = 0; i < numMachines; i++)
            {
                const type = Random.getWeighted(machineDict, "prob");
                delete machineDict[type];
                this.types.push(new Type("machine", type));
            }
        }

    }

    // @TODO: A way to maintain a balance in how much money there is (and how much machines cost) => use "getNextMoneyNumber" in a smart way
    // @TODO: properly calculate that money probability below (HOW?)
    getPossibleTypes() { 
        const dict = {};

        // all ingredients simply follow their usual probability
        for(const typeObject of this.types)
        {
            const originalData = MAIN_TYPES[typeObject.mainType].DICT[typeObject.subType];
            originalData.typeObject = typeObject;
            dict[typeObject.subType] = originalData;
        }

        // money is added as well, but with its own probability
        
        const moneyProb = 1.5
        dict["money"] = { typeObject: new Type("money", "money"), prob: moneyProb }

        return dict;
    }

    getTutorialsNeeded()
    {
        let tutorials = [
            new Type("tutorial", "howtoplay"), 
            new Type("tutorial", "objective")
        ];

        if(this.cfg.expansions.money) 
        { 
            tutorials.push(new Type("tutorial", "money")); 
        }

        if(this.cfg.expansions.fixedFingers) 
        { 
            tutorials.push(new Type("tutorial", "fixedFingers")); 
        }

        for(const t of this.types)
        {
            tutorials.push(new Type("tutorial", t.subType));
        }

        return tutorials;
    }

    getRequiredTypes()
    {
        const arr = [];
        for(const typeObject of this.types)
        {
            const min = MAIN_TYPES[typeObject.mainType].DICT[typeObject.subType].min || 1;
            for(let i = 0; i < min; i++)
            {
                arr.push(typeObject);
            }
        }

        if(this.cfg.expansions.money) { 
            const moneyBounds = this.cfgTypes.moneyBounds;
            const numMoney = Random.rangeInteger(moneyBounds.min, moneyBounds.max);
            for(let i = 0; i < numMoney; i++)
            {
                arr.push(new Type("money", "money"));
            }
        }

        return arr;
    }

    registerTypeChosen(cell, typeObject)
    {
        this.registerInCounter("mainType", typeObject);
        this.registerInCounter("subType", typeObject);

        const isMoney = typeObject.mainType == "money";
        if(isMoney)
        {
            cell.setNum(this.getNextMoneyNumber());
        }
    }

    registerInCounter(dictKey, typeObject)
    {
        const dict = this.counters[dictKey];
        const typeKey = typeObject[dictKey];
        if(!(typeKey in dict)) { dict[typeKey] = 0; }
        dict[typeKey]++;

        let max = 0;
        if(dictKey == "mainType") { 
            max = MAIN_TYPES[typeKey].max || Infinity; 
        } else if(dictKey == "subType") { 
            max = MAIN_TYPES[typeObject.mainType].DICT[typeKey].max || Infinity;
        }

        const newVal = dict[typeKey];
        const reachedMaximum = newVal >= max;
        if(reachedMaximum) { this.removeType(dictKey, typeKey); }
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

    getNextMoneyNumber()
    {
        return Math.floor(Math.random()*3) + 1;
    }
    
}