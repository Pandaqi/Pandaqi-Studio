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

CONFIG._rulebook =
{
    tables:
    {
        base:
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG.assets.base.path,
                    sheetWidth: 8,
                    base: CONFIG.assetsBase,
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
                    sheetURL: CONFIG.assets.advanced.path,
                    sheetWidth: 8,
                    base: CONFIG.assetsBase,
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
                    sheetURL: CONFIG.assets.expert.path,
                    sheetWidth: 8,
                    base: CONFIG.assetsBase,
                },
            },
            data: parseForRulebookTable(SETS.expert)
        },
    }
}

loadRulebook(CONFIG._rulebook);