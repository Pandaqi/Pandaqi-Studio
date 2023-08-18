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
            subType: {},
            moneyToPay: 0,
            moneyToGet: 0,
            fixedFingerCells: 0,
            cells: 0,
        }

        const moneyTargetBounds = this.cfgTypes.moneyTargetBounds;
        this.moneyTargetFraction = Random.range(moneyTargetBounds.min, moneyTargetBounds.max);

        const fixedFingerBounds = this.cfgTypes.fixedFingerBounds;
        this.fixedFingerFraction = Random.range(fixedFingerBounds.min, fixedFingerBounds.max);

        this.drawRandomTypes();
        this.determineMoneyDistribution();
    }
    
    getTypeData(typeObject)
    {
        return MAIN_TYPES[typeObject.mainType].DICT[typeObject.subType];
    }

    drawRandomTypes()
    {
        this.types = [];

        // first, get a copy of the original dictionary
        // but only with the entries that are valid for our current settings
        const ingDict = structuredClone(INGREDIENTS);
        const machineDict = structuredClone(MACHINES);

        for(const [key,data] of ingDict)
        {
            if(this.typeRequirementsMet(data)) { continue; }
            delete ingDict[key];
        }

        for(const [key,data] of machineDict)
        {
            if(this.typeRequirementsMet(data)) { continue; }
            delete machineDict[key];
        }

        // NOTE: tutorial and money are handled separately (not part of type list)
        // get ingredients
        const ingredientBounds = this.cfgTypes.ingredientBounds;
        const numIngredients = Random.rangeInteger(ingredientBounds.min, ingredientBounds.max);
        while(this.types.length < numIngredients)
        {
            const type = Random.getWeighted(ingDict, "prob");
            delete ingDict[type];
            this.types.push(new Type("ingredient", type));
            this.handleRequiredInclusions(type, ingDict);
        }
        
        // get machines (if applicable)
        if(this.cfg.expansions.machines)
        {
            const machineBounds = this.cfgTypes.machineBounds;
            const numMachines = Random.rangeInteger(machineBounds.min, machineBounds.max);
            const targetNumTypes = this.types.length + numMachines;
            while(this.types.length < targetNumTypes)
            {
                const type = Random.getWeighted(machineDict, "prob");
                delete machineDict[type];
                this.types.push(new Type("machine", type));
                this.handleRequiredInclusions(type, machineDict);
            }
        }
    }

    typeRequirementsMet(data)
    {
        if(data.requiredExpansions)
        {
            for(const expansionName of data.requiredExpansions)
            {
                if(!this.cfg.expansions[expansionName]) { return false; }
            }
        }

        return true;
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

    handleRequiredInclusions(type, dict)
    {  
        const data = this.getTypeData(type);
        const reqIng = Random.shuffle(data.requiredIngredients || []);
        this.handleRequiredInclusionsForMainType("ingredient", reqIng, dict);

        const reqMac = Random.shuffle(data.requiredMachines || []);
        this.handleRequiredInclusionsForMainType("machine", reqMac, dict);
    }

    handleRequiredInclusionsForMainType(mainType, list, dict)
    {
        if(list.length <= 0) { return; }

        const subTypes = this.getSubTypesPossible();
        let reqSatisfied = false;
        for(const type of list)
        {
            if(subTypes.includes(type)) { reqSatisfied = true; break; }
        }

        if(reqSatisfied) { return; }

        const typeToAdd = list[0];
        delete dict[typeToAdd];
        this.types.push(new Type(mainType, typeToAdd));
    }

    determineMoneyDistribution()
    {
        if(!this.cfg.expansions.money) { return; }

        // sort types by power (HIGHEST power comes first, so descending)
        this.types.sort((a,b) => { return b.power - a.power; })

        const moneyTypeBounds = this.cfgTypes.moneyTypeBounds;
        const fractionTypesWithMoney = Random.range(moneyTypeBounds.min, moneyTypeBounds.max);
        const numTypesWithMoney = Math.floor(fractionTypesWithMoney * this.types.length);

        const maxPower = this.cfgTypes.maxPower;
        const maxMoney = this.cfgTypes.maxMoney;

        // the highest X types get a (semi-random) money value permanently attached
        for(let i = 0; i < numTypesWithMoney; i++)
        {
            const type = this.types[i];
            const power = this.getTypeData(type).power;
            const moneyBounds = { min: (power / maxPower) * maxMoney, max: ((power + 1) / maxPower) * maxMoney };
            const money = Math.round(Random.range(moneyBounds.min, moneyBounds.max));
            this.types[i].setNum(money);
        }
    }

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
        // money number = depends on how much we're off the target
        // money prob = depends on money number (higher num = more need for money = higher prob)
        const moneyNum = this.getNextMoneyNumber();
        const typeObject = new Type("money", "money");
        typeObject.setNum(moneyNum);

        let moneyProb = (moneyNum / this.cfgTypes.maxMoney) * this.cfgTypes.maxMoneyDrawProb;
        dict["money"] = { typeObject: typeObject, prob: moneyProb }

        return dict;
    }

    getTutorialsNeeded()
    {
        let tutorials = [
            new Type("tutorial", "howtoplay", null, true), 
            new Type("tutorial", "objective", null, true)
        ];

        if(this.cfg.expansions.money) 
        { 
            tutorials.push(new Type("tutorial", "money", null, true)); 
        }

        if(this.cfg.expansions.fixedFingers) 
        { 
            tutorials.push(new Type("tutorial", "fixedFingers", null, true)); 
        }

        if(this.cfg.expansions.recipeBook) 
        { 
            tutorials.push(new Type("tutorial", "recipeBook", null, true)); 
        }

        for(const t of this.types)
        {
            tutorials.push(new Type("tutorial", t.subType, null, true));
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

        return arr;
    }

    getRequiredMoney()
    {
        if(!this.cfg.expansions.money) { return []; }

        const moneyBounds = this.cfgTypes.moneyBounds;
        const numMoney = Random.rangeInteger(moneyBounds.min, moneyBounds.max);
        const arr = [];
        const moneyDistribution = this.getDiscreteDistributionFor(this.getMoneyTargetValue(), numMoney);

        for(let i = 0; i < numMoney; i++)
        {
            const typeObject = new Type("money", "money");
            const moneyNum = moneyDistribution[i];
            typeObject.setNum(moneyNum);
            arr.push(typeObject);
        }

        return arr;
    }

    getMoneyTargetValue()
    {
        return Math.round(this.moneyTargetFraction * this.counters.moneyToPay);
    }

    getDiscreteDistributionFor(value, numParts)
    {
        // note that everything starts at 1, 
        // to prevent buckets accidentally having "0 money" as a value
        const dist = new Array(numParts).fill(1);
        value -= numParts;

        const maxBucketValue = this.cfgTypes.maxValueForMoneyCell;
        const maxPossibleSum = maxBucketValue * numParts;
        value = Math.min(maxPossibleSum, value);

        let runningSum = 0;
        while(runningSum < value)
        {
            let invalidBucket = true;
            let bucketIndex = Math.floor(Math.random() * numParts);
            while(invalidBucket)
            {
                bucketIndex = (bucketIndex + 1) % numParts;
                invalidBucket = dist[bucketIndex] >= maxBucketValue;
            }

            dist[bucketIndex] += 1;
            runningSum += 1;
        }

        return dist;
    }

    getNextMoneyNumber()
    {
        const target = this.getMoneyTargetValue();
        const curMoney = this.counters.moneyToGet;
        const maxMoney = this.cfgTypes.maxMoney;
        const distToTarget = (target - curMoney);

        const alreadyHaveEnoughMoney = (distToTarget <= 0);
        if(alreadyHaveEnoughMoney) { return 0; }

        const clampedDist = Math.min(distToTarget, maxMoney);
        const randomized = Random.rangeInteger(Math.ceil(0.5*clampedDist), clampedDist);
        return randomized;
    }

    registerTypeChosen(cell, typeObject)
    {
        this.counters.cells++;

        this.registerInCounter("mainType", typeObject);
        this.registerInCounter("subType", typeObject);
        this.addFixedFingersIfPossible(cell, typeObject);

        if(typeObject.mainType == "money") {
            this.counters.moneyToGet += typeObject.getNum();
        } else {
            this.counters.moneyToPay += typeObject.getNum();
        }
    }

    addFixedFingersIfPossible(cell, typeObject)
    {
        if(!this.cfg.expansions.fixedFingers) { return; }
        const noSpaceForIt = cell.hasExtraData();
        if(noSpaceForIt) { return; }

        const tooManyCellsWithFixedFingers = this.counters.fixedFingerCells >= this.getFixedFingerTarget();
        if(tooManyCellsWithFixedFingers) { return; }

        cell.addFixedFingers(this.getRandomFixedFingers());
    }

    getFixedFingerTarget()
    {
        return this.fixedFingerFraction * this.counters.cells;
    }

    getRandomFixedFingers()
    {
        const num = Math.floor(Math.random() * 4) + 1; // 1-4 fingers restricted, never nothing or all 5
        const options = Random.shuffle([0,1,2,3,4]);
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            arr.push(options.pop());
        }
        return arr;
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
}