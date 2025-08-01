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
        const sheetURL = (key in DECORATIONS) ? CONFIG.assets.decorations.path : ((key in STALLS) ? CONFIG.assets.stalls.path : CONFIG.assets.attractions.path);
        data.sheetURL = sheetURL;
    }

    console.log(dictOutput);
    return dictOutput;
}

CONFIG._rulebook =
{
    tables:
    {
        base:
        {
            config:
            {
                sheetWidth: 4,
                base: CONFIG.assetsBase,
            },
            icons: parseForRulebookTable(globalDict, "base")
        },

        wishneyland:
        {
            config:
            {
                sheetWidth: 4,
                base: CONFIG.assetsBase,
            },
            icons: parseForRulebookTable(globalDict, "wishneyland")
        },

        unibearsal:
        {
            config:
            {
                sheetWidth: 4,
                base: CONFIG.assetsBase,
            },
            icons: parseForRulebookTable(globalDict, "unibearsal")
        },
    }
}

loadRulebook(CONFIG._rulebook);