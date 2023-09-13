import Type from "./type";
import { MAIN_TYPES, INGREDIENTS, MACHINES, MONEY, TUTORIAL } from "./dictionary";
import Random from "js/pq_games/tools/random/main";
import CONFIG from "./config"
import Cell from "./cell";
import range from "js/pq_games/tools/random/range";
import distributeDiscrete from "js/pq_games/tools/generation/distributeDiscrete";

interface Counters {
    mainType: Record<string,number>,
    subType: Record<string,number>,
    moneyToPay: number,
    moneyToGet: number,
    fixedFingerCells: number,
    cells: number
}

export default class TypeManager
{

    game:any
    counters:Counters
    moneyTargetFraction:number
    fixedFingerFraction:number
    types: Type[]

    constructor(game:any) 
    {
        this.game = game;
        this.counters = {
            mainType: {},
            subType: {},
            moneyToPay: 0,
            moneyToGet: 0,
            fixedFingerCells: 0,
            cells: 0,
        }

        this.drawRandomTypes();
        this.determineExtraDataForTypes();
    }
    
    drawRandomTypes()
    {
        this.types = [];

        // first, get a copy of the original dictionary
        // but only with the entries that are valid for our current settings
        const ingDict = structuredClone(INGREDIENTS);
        const machineDict = structuredClone(MACHINES);

        for(const [key,data] of Object.entries(ingDict))
        {
            if(this.typeRequirementsMet(data)) { continue; }
            delete ingDict[key];
        }

        for(const [key,data] of Object.entries(machineDict))
        {
            if(this.typeRequirementsMet(data)) { continue; }
            delete machineDict[key];
        }

        // NOTE: tutorial and money are handled separately (not part of type list)
        // get ingredients
        const ingredientBounds = CONFIG.types.ingredientBounds;
        const numIngredients = Random.rangeInteger(ingredientBounds.min, ingredientBounds.max);
        while(this.types.length < numIngredients)
        {
            const type = Random.getWeighted(ingDict, "prob");
            delete ingDict[type];
            const typeObj = new Type("ingredient", type);

            const data = typeObj.getData();
            const minIngReq = data.minUniqueTypesRequired || 0;
            if(minIngReq > numIngredients) { continue; }

            const maxIngReq = data.maxUniqueTypesRequired || Infinity;
            if(maxIngReq < numIngredients) { continue; }

            this.types.push(typeObj);
            this.handleRequiredInclusions(typeObj, ingDict);
            this.handleForbiddenInclusions(typeObj, ingDict);
        }
        
        // get machines (if applicable)
        if(CONFIG.expansions.machines)
        {
            const machineBounds = CONFIG.types.machineBounds;
            const numMachines = Random.rangeInteger(machineBounds.min, machineBounds.max);
            const targetNumTypes = this.types.length + numMachines;
            while(this.types.length < targetNumTypes)
            {
                const type = Random.getWeighted(machineDict, "prob");
                delete machineDict[type];
                const typeObj = new Type("machine", type);
                this.types.push(typeObj);
                this.handleRequiredInclusions(typeObj, machineDict);
                this.handleForbiddenInclusions(typeObj, machineDict);
            }
        }
    }

    typeRequirementsMet(data)
    {
        if(data.requiredExpansions)
        {
            for(const expansionName of data.requiredExpansions)
            {
                if(!CONFIG.expansions[expansionName]) { return false; }
            }
        }

        return true;
    }

    getTypesPossible() : Type[]
    {
        return this.types.slice();
    }

    countSubtype(tp:string) : number
    {
        return this.counters.subType[tp];
    }

    getSubTypesPossible()
    {
        const arr = [];
        for(const typeObject of this.types)
        {
            arr.push(typeObject.subType);
        }
        return arr;
    }

    handleForbiddenInclusions(type, dict)
    {
        const data = type.getData();
        const fobIng = Random.shuffle(data.forbiddenIngredients || []);
        this.handleForbiddenInclusionsForMainType("ingredient", fobIng, dict);

        const fobMac = Random.shuffle(data.forbiddenMachines || []);
        this.handleForbiddenInclusionsForMainType("machine", fobMac, dict);
    }

    handleRequiredInclusions(type, dict)
    {  
        const data = type.getData();
        const reqIng = Random.shuffle(data.requiredIngredients || []);
        this.handleRequiredInclusionsForMainType("ingredient", reqIng, dict);

        const reqMac = Random.shuffle(data.requiredMachines || []);
        this.handleRequiredInclusionsForMainType("machine", reqMac, dict);
    }

    handleForbiddenInclusionsForMainType(mainType, list, dict)
    {
        if(list.length <= 0) { return; }

        for(const elem of list)
        {
            // if we already added the forbidden fruit, just remove it again
            // @TODO: this isn't clean, can we "look ahead" and prevent this instead?
            const alreadyAdded = !(elem in dict);
            if(alreadyAdded) { 
                this.removeType("subType", elem);
                continue; 
            }

            // otherwise, just remove it from the dictionary, so the forbidden type is never chosen
            delete dict[elem];
        }
    }

    handleRequiredInclusionsForMainType(mainType, list, dict)
    {
        if(list.length <= 0) { return; }

        // check if we already happen to HAVE the required inclusions; if so, abort
        const subTypes = this.getSubTypesPossible();
        let reqSatisfied = false;
        for(const type of list)
        {
            if(subTypes.includes(type)) { reqSatisfied = true; break; }
        }

        if(reqSatisfied) { return; }

        // if there are multiple, we add a random number of them (1 is enough, but more might be more fun)
        const numToAdd = Random.rangeInteger(1, list.length);
        Random.shuffle(list);
        for(let i = 0; i < numToAdd; i++)
        {
            const typeToAdd = list[i];
            const alreadyAdded = !(typeToAdd in dict);
            if(alreadyAdded) { continue; }

            delete dict[typeToAdd];
            this.types.push(new Type(mainType, typeToAdd));
        }
    }

    determineExtraDataForTypes()
    {
        if(!CONFIG.expansions.money && !CONFIG.expansions.fixedFingers) { return; }

        // sort types by power (HIGHEST power comes first, so descending)
        this.types.sort((a,b) => { 
            return b.getPower() - a.getPower();
        })

        const numTypesWithMoney = CONFIG.expansions.money ? Math.floor(range(CONFIG.types.moneyTypeBounds) * this.types.length) : 0;
        const numTypesWithFixedFingers = CONFIG.expansions.fixedFingers ? Math.floor(range(CONFIG.types.fixedFingerBounds) * this.types.length) : 0;

        const maxPower = CONFIG.types.maxPower;
        const maxMoney = CONFIG.types.maxMoney;

        // the highest X types get a (semi-random) money value permanently attached
        const totalTypesToAssign = Math.min(numTypesWithMoney + numTypesWithFixedFingers, this.types.length);
        for(let i = 0; i < totalTypesToAssign; i++)
        {
            const type = this.types[i];

            const shouldBeMoney = i < numTypesWithMoney;
            if(shouldBeMoney)
            {
                const power = type.getPower();
                const moneyBounds = { min: (power / maxPower) * maxMoney, max: ((power + 1) / maxPower) * maxMoney };
                const money = Math.round(Random.range(moneyBounds.min, moneyBounds.max));
                type.setNum(money);
                continue;
            }
            
            type.setFixedFingers(this.getRandomFixedFingers());            
        }
    }

    getCellDistribution(numCellsToFill:number) : Type[]
    {
        // add tutorials, however many needed
        const types : Type[] = this.getTutorialsNeeded();
        numCellsToFill -= types.length;

        // add required types (usually just at least 1 of each type)
        const reqTypes : Type[] = this.getRequiredTypes();
        for(const type of reqTypes)
        {
            types.push(type);
            this.registerTypeChosen(type);
            numCellsToFill--;
        }

        // calculate exactly how much cells we want to devote to each type
        const numMachines = CONFIG.expansions.machines ? Math.round(range(CONFIG.types.numPlaced.machine) * numCellsToFill) : 0;
        const numMoney = CONFIG.expansions.money ? Math.round(range(CONFIG.types.numPlaced.money) * numCellsToFill) : 0;
        const numIngredients = numCellsToFill - numMachines - numMoney;

        console.log(numIngredients);
        console.log(numMachines);
        console.log(numMoney);

        // then place that
        for(let i = 0; i < numIngredients; i++)
        {
            const obj = this.pickRandomIngredient();
            if(!obj) { break; }
            types.push(obj);
            this.registerTypeChosen(obj);
        }

        for(let i = 0; i < numMachines; i++)
        {
            const obj = this.pickRandomMachine();
            if(!obj) { break; }
            types.push(obj);
            this.registerTypeChosen(obj);
        }

        console.log(types.slice());

        if(numMoney > 0)
        {
            // for money, we calculate the distribution of values beforehand
            // (which we can do now, as machines+ingredients have all been placed)
            const moneyTarget = Math.round(this.counters.moneyToPay * range(CONFIG.types.moneyPercentagePayable));
            const moneyDistribution = distributeDiscrete(moneyTarget, numMoney, 1, CONFIG.types.maxValueForMoneyCell);
            for(let i = 0; i < numMoney; i++)
            {
                const typeObject = new Type("money", "money");
                if(i >= moneyDistribution.length) { break; }

                const moneyNum = moneyDistribution[i];
                typeObject.setNum(moneyNum);
                types.push(typeObject);
                this.registerTypeChosen(typeObject);
            }
        }

        Random.shuffle(types);
        return types;
    }

    getTutorialsNeeded()
    {
        if(!CONFIG.includeRules) { return []; }

        let tutorials = [
            new Type("tutorial", "howtoplay", null, true), 
            new Type("tutorial", "objective", null, true)
        ];

        if(CONFIG.expansions.money) 
        { 
            tutorials.push(new Type("tutorial", "money", null, true)); 
        }

        if(CONFIG.expansions.fixedFingers) 
        { 
            tutorials.push(new Type("tutorial", "fixedFingers", null, true)); 
        }

        if(CONFIG.expansions.recipeBook) 
        { 
            tutorials.push(new Type("tutorial", "recipeBook", null, true)); 
        }

        for(const t of this.types)
        {
            tutorials.push(new Type(t.mainType, t.subType, null, true));
        }

        return tutorials;
    }

    getRequiredTypes()
    {
        const arr = [];
        for(const typeObject of this.types)
        {
            const min = MAIN_TYPES[typeObject.mainType].DICT[typeObject.subType].min ?? 1;
            for(let i = 0; i < min; i++)
            {
                arr.push(typeObject);
            }
        }

        return arr;
    }

    registerTypeChosen(typeObject:Type)
    {
        this.counters.cells++;

        this.registerInCounter("mainType", typeObject);
        this.registerInCounter("subType", typeObject);

        if(typeObject.mainType == "money") {
            this.counters.moneyToGet += typeObject.getNum();
        } else {
            this.counters.moneyToPay += typeObject.getNum();
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

    getRandomFixedFingers()
    {
        const num = range(1,4); // 1-4 fingers restricted, never nothing or all 5
        const options = Random.shuffle([0,1,2,3,4]);
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            arr.push(options.pop());
        }
        return arr;
    }

    pickRandomIngredient() : Type
    {
        const dict = this.getDrawDict("ingredient");
        if(Object.keys(dict).length <= 0) { return null; }
        const key = Random.getWeighted(dict);
        return dict[key].typeObject;
    }

    pickRandomMachine() : Type
    {
        const dict = this.getDrawDict("machine");
        if(Object.keys(dict).length <= 0) { return null; }
        const key = Random.getWeighted(dict);
        return dict[key].typeObject;
    }

    getDrawDict(mainType:string = null)
    {
        const dict = {};
        for(const typeObject of this.types)
        {
            const noDrawableType = typeObject.tutorial || typeObject.mainType == "money";
            if(noDrawableType) { continue; }
            if(mainType && typeObject.mainType != mainType) { continue; }

            const originalData = MAIN_TYPES[typeObject.mainType].DICT[typeObject.subType];
            originalData.typeObject = typeObject;
            dict[typeObject.subType] = originalData;
        }
        return dict;
    }
}