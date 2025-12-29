import { EGGS_SHARED } from "games/easter-eggventures/shared/dictShared";
import { CONFIG } from "../shared/config";
import { TileType } from "../shared/dict";
import Tile from "./tile";
import { shuffle } from "lib/pq-games";

export const eggPicker = () : Tile[] =>
{
    const tiles = [];
    if(!CONFIG._settings.sets.base.value) { return; }

    const eggTypes = Object.keys(EGGS_SHARED);
    const maxNumEggs = CONFIG.generation.maxNumEggs;
    shuffle(eggTypes);
    while(eggTypes.length > maxNumEggs)
    {
        eggTypes.pop();
    }

    for(const key of eggTypes)
    {
        const data = EGGS_SHARED[key];
        const freq = data.freq ?? CONFIG.generation.defaultFrequencies.eggToken;

        for(let i = 0; i < freq; i++)
        {
            tiles.push(new Tile(TileType.EGG, key))
        }
    }

    return tiles;
}