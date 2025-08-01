import { convertDictToRulesTableHTML } from "js/pq_rulebook/table";
import { CONFIG } from "../shared/config";
import { MAP_TILES, STOOM_CARDS } from "../shared/dict";

const mapTilesClean = Object.assign({}, MAP_TILES);
for(const [key,data] of Object.entries(mapTilesClean))
{
    const set = data.set ?? "base";
    if(set == "pepernootPlekken") { continue; }
    delete mapTilesClean[key];
}

CONFIG._rulebook =
{
    tables:
    {
        "pepernoot-plekken":
        {
            config:
            {
                sheetURL: CONFIG.assets.map_tiles.path,
                sheetWidth: 6,
                base: CONFIG.assetsBase,
            },
            icons: mapTilesClean
        },

        "stoom-icoontjes":
        {
            config:
            {
                sheetURL: CONFIG.assets.stoom_cards.path,
                sheetWidth: 4,
                base: CONFIG.assetsBase,
            },
            icons: STOOM_CARDS
        },
    }
}

loadRulebook(CONFIG._rulebook);