import Random from "js/pq_games/tools/random/main";

type reqprop = string|{ prop: string, num: number }

export default class BalancedDictionaryPicker
{
    dict:Record<string,any>
    numPerType:Record<string,any>
    typesPossible:string[]
    requiredProperties:reqprop[]

    constructor(dict:Record<string,any> = {})
    {
        this.dict = structuredClone(dict);
        this.numPerType = {}
        this.typesPossible = []
        this.requiredProperties = [];
    }

    // Each property is an object { type: string, num: integer }
    // This forces NUM objects with that PROPERTY
    // You can also just give a string, in which case number is 1
    setRequiredProperties(list:reqprop[])
    {
        this.requiredProperties = list;
    }

    pickPossibleTypes(config:Record<string,any>, numBounds:any)
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
            if(typeof reqProp === "object") { 
                prop = reqProp.prop; 
                num = reqProp.num; 
            }

            const arr = this.getAllTypesWithProperty(tempDict, prop as string);
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

    getAllTypesWithProperty(dict: Record<string, any>, prop: string)
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

    typeIncluded(type: string)
    {
        return this.typesPossible.includes(type)
    }

    addPossibleTypeForced(type: string)
    {
        this.typesPossible.push(type);
    }

    removePossibleTypeForced(type: string)
    {
        this.typesPossible.splice(this.typesPossible.indexOf(type), 1);
    }

    addPossibleType(optionList: any[], dict: Record<string, any>, type: string)
    {
        const alreadyAdded = optionList.includes(type);
        if(alreadyAdded) { return; }

        const data = dict[type];
        delete dict[type];
        optionList.push(type);
        this.handleRequiredInclusions(optionList, dict, data);
    }

    removePossibleType(optionList: any[], dict: { [x: string]: any; }, type: string | number)
    {
        delete dict[type];
        optionList.splice(optionList.indexOf(type), 1);
    }

    typeRequirementsMet(config: Record<string, any>, data: { unpickable: any; expansion: any[]; })
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

    handleRequiredInclusions(optionList: any, dict: any, data: { requiredTypes: any[]; })
    {
        if(!data.requiredTypes) { return; }
        if(!Array.isArray(data.requiredTypes)) { data.requiredTypes = [data.requiredTypes]; }

        for(const tp of data.requiredTypes)
        {
            this.addPossibleType(optionList, dict, tp);
        }
    }

    getDataFor(type: string)
    {
        return this.dict[type];
    }

    getFullTypeList(num: number)
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
    pickType(optionList: string[], list: any[], tempDict: {}, type: string)
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