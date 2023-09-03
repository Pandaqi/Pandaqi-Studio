import Random from "js/pq_games/tools/random/main";

export default class BalancedDictionaryPicker
{
    constructor(dict)
    {
        this.dict = structuredClone(dict);
        this.numPerType = {}
        this.typesPossible = []
        this.requiredProperties = [];
    }

    // Each property is an object { type: string, num: integer }
    // This forces NUM objects with that PROPERTY
    // You can also just give a string, in which case number is 1
    setRequiredProperties(list)
    {
        this.requiredProperties = list;
    }

    pickPossibleTypes(config, numBounds)
    {
        const tempPossible = [];

        const tempDict = structuredClone(this.dict);
        for(const [key,data] of Object.entries(tempDict))
        {
            if(this.typeRequirementsMet(config, data)) { continue; }
            delete tempDict[key];
        }

        for(const reqProp of this.requiredProperties)
        {
            let prop = reqProp;
            let num = 1;
            if(typeof reqProp === "object") { prop = reqProp.prop; num = reqProp.num; }

            const arr = this.getAllTypesWithProperty(tempDict, prop);
            Random.shuffle(arr);
            
            const pickedTypes = arr.slice(0, Math.min(num, arr.length));
            for(const pickedType of pickedTypes)
            {
                this.addPossibleType(tempPossible, tempDict, pickedType);
            }
        }

        var num = Random.rangeInteger(numBounds.min, numBounds.max)
        while(tempPossible.length < num)
        {
            if(Object.keys(tempDict).length <= 0) { break; }

            const type = Random.getWeighted(tempDict, "prob");
            this.addPossibleType(tempPossible, tempDict, type);
        }

        this.typesPossible = tempPossible;
    }

    getAllTypesWithProperty(dict, prop)
    {
        const arr = [];
        for(const [key,data] of Object.entries(dict))
        {
            if(!data[prop]) { continue; }
            arr.push(key);
        }
        return arr;
    }

    getPossibleTypes()
    {
        return this.typesPossible;
    }

    typeIncluded(type)
    {
        return this.typesPossible.includes(type)
    }

    addPossibleTypeForced(type)
    {
        this.typesPossible.push(type);
    }

    removePossibleTypeForced(type)
    {
        this.typesPossible.splice(this.typesPossible.indexOf(type), 1);
    }

    addPossibleType(optionList, dict, type)
    {
        const alreadyAdded = optionList.includes(type);
        if(alreadyAdded) { return; }

        const data = dict[type];
        delete dict[type];
        optionList.push(type);
        this.handleRequiredInclusions(optionList, dict, data);
    }

    removePossibleType(optionList, dict, type)
    {
        delete dict[type];
        optionList.splice(optionList.indexOf(type), 1);
    }

    typeRequirementsMet(config, data)
    {
        console.log(data);
        if(data.unpickable) { return false; }

        // check if expansions are available
        if(data.expansion)
        {
            if(!Array.isArray(data.expansion)) { data.expansion = [data.expansion] }
            for(const exp of data.expansion)
            {
                if(!config.expansions[exp]) { return false; }
            }
        }

        return true;
    }

    // @TODO: also allow forbidden types/required EXCLUSIONS
    // @TODO: also check for blankly required types with a simple "required: true" property, at the start

    handleRequiredInclusions(optionList, dict, data)
    {
        if(!data.requiredTypes) { return; }
        if(!Array.isArray(data.requiredTypes)) { data.requiredTypes = [data.requiredTypes]; }

        for(const tp of data.requiredTypes)
        {
            this.addPossibleType(optionList, dict, tp);
        }
    }

    getDataFor(type)
    {
        return this.dict[type];
    }

    getFullTypeList(num)
    {
        const list = [];

        console.log(num);

        const tempPossible = this.typesPossible.slice();

        // initialize proper values for all optional settings
        for(const data of Object.values(this.dict))
        {
            var minAbs = data.minAbs || 1;
            var minRel = data.minRel ? data.minRel * num : 1;
            data.min = Math.round(Math.max(minAbs, minRel));

            var maxAbs = data.maxAbs || Infinity;
            var maxRel = data.maxRel ? data.maxRel * num : Infinity;
            data.max = Math.round(Math.min(maxAbs, maxRel));
        }

        // first handle the minimum
        const tempDict = {};
        for(const type of tempPossible)
        {
            const data = this.getDataFor(type);
            tempDict[type] = structuredClone(data);
            for(let i = 0; i < data.min; i++)
            {
                this.pickType(tempPossible, list, tempDict, type);
            }
        }

        // then fill up randomly
        while(list.length < num)
        {
            const type = Random.getWeighted(tempDict, "prob");
            this.pickType(tempPossible, list, tempDict, type);
        }

        return list;
    }

    // as we register types, also count them + remove if maximum reached
    pickType(optionList, list, tempDict, type)
    {
        list.push(type);

        if(!this.numPerType[type]) { this.numPerType[type] = 0; }
        this.numPerType[type]++;

        const data = this.getDataFor(type);
        if(this.numPerType[type] >= data.max)
        {
            this.removePossibleType(optionList, tempDict, type);
        }
    }
}