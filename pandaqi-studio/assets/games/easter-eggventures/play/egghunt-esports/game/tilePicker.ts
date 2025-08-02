import { EGGS_SHARED } from "games/easter-eggventures/shared/dictShared";
import { CONFIG } from "../shared/config";
import { OBSTACLES, SPECIAL_EGGS, TileType } from "../shared/dict";
import Tile from "./tile";
import shuffle from "js/pq_games/tools/random/shuffle";

export const tilePicker = () : Tile[] =>
{
    const tiles = [];

    generatePawns(tiles);
    generateEggs(tiles);
    generateSpecialEggs(tiles);
    generateObstacles(tiles);

    return tiles;
}

const generatePawns = (tiles) =>
{
    if(!CONFIG.sets.base) { return; }
    const maxNumPlayers = CONFIG.generation.maxNumPlayers;
    for(let i = 0; i < maxNumPlayers; i++)
    {
        tiles.push(new Tile(TileType.PAWN, "", i));
    }
}

const generateEggs = (tiles) =>
{
    if(!CONFIG.sets.base) { return; }

    const numUniqueEggs = CONFIG.generation.maxNumEggs;
    const numbers = CONFIG.generation.defaultEggNumbering.slice();

    const eggTypes = Object.keys(EGGS_SHARED);
    shuffle(eggTypes);
    while(eggTypes.length > numUniqueEggs)
    {
        eggTypes.pop();
    }

    for(const key of eggTypes)
    {
        const data = EGGS_SHARED[key];
        for(const num of numbers)
        {
            tiles.push(new Tile(TileType.EGG, key, num));
        }
    }
}

const generateSpecialEggs = (tiles) =>
{
    if(!CONFIG.sets.specialEggs) { return; }

    for(const [key,data] of Object.entries(SPECIAL_EGGS))
    {
        const freq = data.freq ?? CONFIG.generation.defaultFrequencies.specialEgg;
        for(let i = 0; i < freq; i++)
        {
            tiles.push(new Tile(TileType.SPECIAL, key));
        }
    }
}

const generateObstacles = (tiles) =>
{
    for(const [key,data] of Object.entries(OBSTACLES))
    {
        const set = data.set ?? "base";
        if(!CONFIG.sets[set]) { continue; }

        const freq = data.freq ?? CONFIG.generation.defaultFrequencies.obstacle;
        for(let i = 0; i < freq; i++)
        {
            tiles.push(new Tile(TileType.OBSTACLE, key));
        }
    }
}