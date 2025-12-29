import { loadRulebook } from "lib/pq-rulebook";
import { CONFIG } from "../shared/config";
import { MAP_TILES, STOOM_CARDS } from "../shared/dict";

const mapTilesClean = Object.assign({}, MAP_TILES);
for(const [key,data] of Object.entries(mapTilesClean))
{
    const set = data.set ?? "base";
    if(set == "pepernootPlekken") { continue; }
    delete mapTilesClean[key];
}

const CONFIG_RULEBOOK =
{
    tables:
    {
        "pepernoot-plekken":
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.map_tiles.path,
                    sheetWidth: 6,
                    base: CONFIG._resources.base,
                }
            },
            data: mapTilesClean
        },

        "stoom-icoontjes":
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG._resources.files.stoom_cards.path,
                    sheetWidth: 4,
                    base: CONFIG._resources.base,
                },
            },
            data: STOOM_CARDS
        },
    }
}

loadRulebook(CONFIG_RULEBOOK);