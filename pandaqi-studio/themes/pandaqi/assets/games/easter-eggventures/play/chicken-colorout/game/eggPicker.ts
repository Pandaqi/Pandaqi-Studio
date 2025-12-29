import { EGGS_SHARED } from "games/easter-eggventures/shared/dictShared";
import { CONFIG } from "../shared/config";
import { TileType } from "../shared/dict";
import Tile from "./tile";

export const eggPicker = () : Tile[] =>
{
    const tiles = [];
        
    if(CONFIG._settings.sets.base.value)
    {
        const maxNumEggs = CONFIG.generation.maxNumEggs;
        const eggTypes = Object.keys(EGGS_SHARED).slice(0, maxNumEggs);

        for(const key of eggTypes)
        {
            const data = EGGS_SHARED[key];
            const freq = (data.freq ?? CONFIG.generation.defaultFrequencies.eggToken) ?? 6;

            for(let i = 0; i < freq; i++)
            {
                tiles.push(new Tile(TileType.EGG, key))
            }
        }
    }

    if(CONFIG._settings.sets.score.value)
    {
        for(const [num,freq] of Object.entries(CONFIG.generation.victoryEggsDistribution))
        {
            for(let i = 0; i < (freq as number); i++)
            {
                tiles.push(new Tile(TileType.EGG, "victory", { num: parseInt(num) }));
            }
        }
    }

    return tiles;
}