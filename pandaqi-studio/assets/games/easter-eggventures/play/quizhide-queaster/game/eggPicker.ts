import { EGGS_SHARED } from "games/easter-eggventures/shared/dictShared";
import { CONFIG } from "../shared/config";
import { OBSTACLES, TileType } from "../shared/dict";
import Tile from "./tile";

export const eggPicker = () : Tile[] =>
{
    const tiles = [];

    generateEggTokens(tiles);
    generateObstacles(tiles);

    return tiles;
}

const generateEggTokens = (tiles) =>
{
    if(!CONFIG.sets.base) { return; }
    
    // @NOTE: We DON'T shuffle these types, because the Score Cards depend on this, and it would be a mess to track it across systems and/or expansions.
    // So it just cuts off the first X it needs.
    const maxNumEggs = CONFIG.generation.maxNumEggs;
    const eggTypes = Object.keys(EGGS_SHARED).slice(0, maxNumEggs);

    for(const key of eggTypes)
    {
        const data = EGGS_SHARED[key];
        const freq = data.freq ?? CONFIG.generation.defaultFrequencies.eggToken;

        for(let i = 0; i < freq; i++)
        {
            tiles.push(new Tile(TileType.EGG, key))
        }
    }
}

const generateObstacles = (tiles) =>
{
    if(!CONFIG.sets.base) { return; }

    for(const [key,data] of Object.entries(OBSTACLES))
    {
        const set = data.set ?? "base";
        if(!CONFIG.sets[set]) { continue; }

        const freq = data.freq ?? CONFIG.generation.defaultFrequencies.obstacleTile;
        for(let i = 0; i < freq; i++)
        {
            tiles.push(new Tile(TileType.OBSTACLE, key));
        }
    }
}