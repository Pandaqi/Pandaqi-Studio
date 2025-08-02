import { CONFIG } from "../shared/config";
import { ActionSet, SETS, SUSPECTS } from "../shared/dict";

const suspectsParsed = Object.assign({}, SUSPECTS);
delete suspectsParsed.loupe;
delete suspectsParsed.traitor;

const parseRulebookTableData = (dict:ActionSet) =>
{
    for(const [key,data] of Object.entries(dict))
    {
        let desc = Array.isArray(data.desc) ? data.desc[0] : data.desc;
        desc = desc.replace('<img id="suspects" frame="0">', 'loupe');
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
            data: parseRulebookTableData(SETS.base)
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
            data: parseRulebookTableData(SETS.advanced)
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
            data: parseRulebookTableData(SETS.expert)
        },

        powers:
        {
            icons: 
            {
                config:
                {
                    sheetURL: CONFIG.assets.suspect_powers.path,
                    sheetWidth: 11,
                    base: CONFIG.assetsBase,
                },
            },
            data: suspectsParsed
        }
    },
    
    icons:
    {
        inline:
        {
            config:
            {
                sheetURL: "misc.webp",
                sheetWidth: 8,
                base: CONFIG.assetsBase,
            },
            icons:
            {
                "only-review": { frame: 0 },
                "only-play": { frame: 1 },
                "skull": { frame: 5 },
                "card": { frame: 6 }
            }
        }
    }
}

loadRulebook(CONFIG._rulebook);