import { loadRulebook } from "lib/pq-rulebook";
import { CONFIG } from "../shared/config";
import { ActionSet, SETS } from "../shared/dict";

const parseForRulebookTable = (dict:ActionSet) =>
{
    for(const [key,data] of Object.entries(dict))
    {
        let desc = Array.isArray(data.desc) ? data.desc[0] : data.desc;
        desc = desc.replace('<img id="misc" frame="0">', 'points');
        desc = desc.replace('<img id="misc" frame="1">', 'items');
        desc = desc.replace('<img id="misc" frame="2">', 'hazards');
        dict[key].desc = desc;
    }

    return dict;
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
                    sheetURL: CONFIG._resources.files.base.path,
                    sheetWidth: 8,
                    base: CONFIG._resources.base,
                },
            },
            data: parseForRulebookTable(SETS.base)
        },

        advanced:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.advanced.path,
                    sheetWidth: 8,
                    base: CONFIG._resources.base,
                },
            },
            data: parseForRulebookTable(SETS.advanced)
        },

        expert:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.expert.path,
                    sheetWidth: 8,
                    base: CONFIG._resources.base,
                },
            },
            data: parseForRulebookTable(SETS.expert)
        },
    }
}

loadRulebook(CONFIG_RULEBOOK);