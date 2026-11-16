import { loadRulebook } from "lib/pq-rulebook";
import { CONFIG } from "../shared/config";
import { ATTRACTIONS, DECORATIONS, GeneralData, STALLS } from "../shared/dict";

const globalDict:Record<string,GeneralData> = Object.assign(Object.assign(Object.assign({}, ATTRACTIONS), STALLS), DECORATIONS);
const parseForRulebookTable = (dict:Record<string,GeneralData>, setTarget:string) =>
{
    const dictOutput = {};
    for(const [key,data] of Object.entries(dict))
    {
        const set = data.set ?? "base";
        if(set != setTarget) { continue; }
        dictOutput[key] = data;

        // @IMPORTANT! Save sheetURL on object itself, as different things in the same rules table require different images!
        const sheetURL = (key in DECORATIONS) ? CONFIG._resources.files.decorations.path : ((key in STALLS) ? CONFIG._resources.files.stalls.path : CONFIG._resources.files.attractions.path);
        data.sheetURL = sheetURL;
    }

    console.log(dictOutput);
    return dictOutput;
}

const CONFIG_RULEBOOK =
{
    tables:
    {
        base:
        {
            icons:
            {
                config:
                {
                    sheetWidth: 4,
                    base: CONFIG._resources.base,
                }
            },
            data: parseForRulebookTable(globalDict, "base")
        },

        wishneyland:
        {
            icons:
            {
                config:
                {
                    sheetWidth: 4,
                    base: CONFIG._resources.base,
                }
            },
            data: parseForRulebookTable(globalDict, "wishneyland")
        },

        unibearsal:
        {
            icons:
            {
                config:
                {
                    sheetWidth: 4,
                    base: CONFIG._resources.base,
                }
            },
            data: parseForRulebookTable(globalDict, "unibearsal")
        },
    }
}

loadRulebook(CONFIG_RULEBOOK);