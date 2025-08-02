import { CELL_TYPES, BASE_TYPES } from "../shared/dict"
import Random from "js/pq_games/tools/random/main"
import { CONFIG } from "../shared/config"

export default class Types 
{
    game: any;
    constructor(game:any)
    {
        this.game = game;

        const maxTries = 100;
        let numTries = 0;
        do {
            this.setup();
            numTries++;
        } while(this.hasInvalidTypeDictionary() && numTries < maxTries)
    }

    hasInvalidTypeDictionary()
    {
        const maxTypes = CONFIG.types.maxPerDifficulty[CONFIG.difficulty];

        // the -1 is for the "scroll" type which is ALWAYS added
        const numTypes = Object.keys(CONFIG.typeDict).length - 1;
        return maxTypes <= numTypes;
    }

    getAllWithProperty(dict, prop, val)
    {
        const list = [];
        for(const [key, data] of Object.entries(dict))
        {
            if(data[prop] != val) { continue; }
            list.push(key);
        }
        return list;
    }

    getAllOfType(dict, type)
    {
        const list = [];
        for(const [key, data] of Object.entries(dict))
        {
            // @ts-ignore
            if(data.type != type) { continue; }
            list.push(key);
        }
        return list
    }

    getAllWithId(dict, id)
    {
        const list = [];
        for(const [key, data] of Object.entries(dict))
        {
            // @ts-ignore
            if(data.id != id) { continue; }
            list.push(key);
        }
        return list
    }

    removeKeysFromDict(dict, list)
    {
        // first, also include any shared IDs
        // (turn it into a set to prevent duplicates)
        let newSet : Set<string> = new Set(list);
        for(const elem of list)
        {
            const data = dict[elem];
            if(!data) { continue; }
            if(data.hasMultiple) 
            { 
                const newValues = this.getAllWithId(dict, data.id);
                for(const val of newValues)
                {
                    newSet.add(val);
                }
            }
        }

        // then actually remove them
        for(const elem of Array.from(newSet))
        {
            delete dict[elem];
        }
    }

    checkIfPropertyInData(dict, types, prop)
    {
        let exists = false;
        for(const type of types)
        {
            if(!dict[type][prop]) { continue; }
            exists = true;
            break;
        }
        return exists;
    }

    setup()
    {
        CONFIG.typeDict = {}; // reset to prevent leftover info on next tries in loop
        const fullTypesDict = structuredClone(CELL_TYPES);

        // remove any invalid types
        const typesDict = {}
        const difficulties = ["easy", "medium", "hard"];
        const gameDiffNum = difficulties.indexOf(CONFIG.difficulty);
        for(const [type,data] of Object.entries(fullTypesDict))
        {
            const diffNum = difficulties.indexOf(data.difficulty || "easy");
            if(diffNum > gameDiffNum) { continue; }
            if(data.ignore) { continue; } // a hard ignore on anything I decided not to include in the final version

            typesDict[type] = data;
        }

        // copy baseData and sharedID onto types that need it
        for(const [type,data] of Object.entries(fullTypesDict))
        {
            const lastCharacter = type.slice(type.length-1);
            const hasMultiple = !isNaN(parseInt(lastCharacter));
            let id = type;
            if(hasMultiple) { id = type.slice(0, -1); }

            data.id = id;
            data.hasMultiple = hasMultiple;

            const baseData = BASE_TYPES[id];
            for(const [key,val] of Object.entries(baseData))
            {
                if(key in data) { continue; }
                data[key] = val;
            }

            if(!("tutFrame" in data)) { data.tutFrame = data.frame; }
        }

        // pick our first types following the set template (which types must surely have ONE in there)
        let types = [];
        const setTemplate = CONFIG.types.setTemplate;
        for(const type of setTemplate)
        {
            const options = this.getAllOfType(typesDict, type);
            const tempOptionDict = {};
            for(const option of options)
            {
                tempOptionDict[option] = fullTypesDict[option];
            }

            const addAll = type == "required";
            if(addAll) { 
                types = types.concat(options); 
                this.removeKeysFromDict(typesDict, options);
            } else { 
                const option = Random.getWeighted(tempOptionDict, "prob");
                types.push(option);
                this.removeKeysFromDict(typesDict, [option]);
            }
        }

        // EXCEPTION: make sure we have something that uses blank squares
        const typeUsesBlankSquares = this.checkIfPropertyInData(CELL_TYPES, types, "usesBlankSquares");
        if(!typeUsesBlankSquares)
        {
            const options = this.getAllWithProperty(CELL_TYPES, "usesBlankSquares", true);
            const tempOptionDict = {};
            for(const option of options)
            {
                tempOptionDict[option] = fullTypesDict[option];
            }

            const randOption = Random.getWeighted(tempOptionDict, "prob");
            types.push(randOption);
            this.removeKeysFromDict(typesDict, [randOption]);
        }

        // fill up the list of types as needed
        const setBounds = CONFIG.types.maxSetSize;
        const setMax = Random.rangeInteger(setBounds.min, setBounds.max);
        while(types.length < setMax)
        {
            const randOption = Random.getWeighted(typesDict, "prob");
            types.push(randOption);
            this.removeKeysFromDict(typesDict, [randOption]);
        }

        // EXCEPTION: some types specifically need a spy in the game
        const needsSpy = this.checkIfPropertyInData(CELL_TYPES, types, "needsSpy");
        const alreadyHasSpy = types.includes("spy");
        if(needsSpy && !alreadyHasSpy)
        {
            const alreadyAtMaxSize = types.length >= setBounds.max;
            if(alreadyAtMaxSize) { types.pop(); }

            types.push("spy");
            this.removeKeysFromDict(typesDict, ["spy"]);

        }

        // this should always be LAST, as the debug types override the rest
        const debugTypes = CONFIG.types.debug;
        if(debugTypes.length > 0)
        {
            types = debugTypes.slice();
            types.push("scroll");
        }

        // @NOTE: "typesDict" is emptied as we go (to prevent picking types again)
        // but "fullTypesDict" is actually amended with extra data (and BASE_TYPES copied where needed)
        // so we want THAT one in the end
        const newDict = {};
        for(const type of types)
        {
            newDict[type] = fullTypesDict[type];
        }

        // some generation parameters (for types) change based on other user-input settings
        // In this case: if we place no tutorials, still place some SCROLLS because we need their "rot" mechanic still
        // And a good benchmark is the number of types included
        const placeTutorials = CONFIG.includeRules;
        if(!placeTutorials)
        {
            // @ts-ignore
            if(newDict.scroll) { newDict.scroll.num = { min: types.length, max: types.length }; }
        }


        CONFIG.typeDict = newDict;

        console.log("[DEBUG] Final type dictionary");
        console.log(CONFIG.typeDict);
    }
}