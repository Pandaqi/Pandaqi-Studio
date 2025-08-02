import shuffle from "js/pq_games/tools/random/shuffle";
import { CONFIG } from "../shared/config";
import { HANDICAPS, POWERS, SPECIAL_EGGS, TileType } from "../shared/dict";
import Tile from "./tile";
import { EGGS_SHARED } from "games/easter-eggventures/shared/dictShared";

export const tilePicker = () =>
{
    const tiles : Tile[] = [];

    generateRegularEggs(tiles);
    generateSpecialEggs(tiles);
    generatePowerEggs(tiles);

    return tiles;
}

const generateRegularEggs = (tiles) =>
{
    if(!CONFIG.sets.base) { return; }

    const specialEggInterval = CONFIG.generation.specialEggInterval;
    const maxNumber = CONFIG.generation.maxEggNumber;

    const allNumbers = [];
    for(let i = 1; i <= maxNumber; i++)
    {
        if(i % specialEggInterval == 0) { continue; }
        allNumbers.push(i);
    }
    shuffle(allNumbers);

    // this just allows us to cut off the dictionary and play with how many unique eggs the game should generate
    // (all of them is probably way too much + gets us in trouble with the unique numbers)
    const numUniqueEggs = CONFIG.generation.numUniqueEggs;
    const eggTypes = Object.keys(EGGS_SHARED);
    shuffle(eggTypes);
    while(eggTypes.length > numUniqueEggs)
    {
        eggTypes.pop();
    }

    const freqGoal = CONFIG.generation.defaultFrequencies.goalEgg ?? 2;
    for(const key of eggTypes)
    {
        // the tiles with which we play
        const data = EGGS_SHARED[key];
        const freq = (data.freq ?? CONFIG.generation.defaultFrequencies.regularEgg) ?? 6;
        for(let i = 0; i < freq; i++)
        {
            const num = allNumbers.pop();
            tiles.push(new Tile(TileType.REGULAR, key, num));
        }

        // the goal tiles
        for(let i = 0; i < freqGoal; i++)
        {
            tiles.push(new Tile(TileType.GOAL, key));
        }
    }
}

const generateSpecialEggs = (tiles) =>
{
    if(!CONFIG.sets.special) { return; }

    const specialEggInterval = CONFIG.generation.specialEggInterval;
    const maxNumber = CONFIG.generation.maxEggNumber;
    const allNumbers = [];
    let counter = specialEggInterval;
    while(counter <= maxNumber)
    {
        allNumbers.push(counter);
        counter += specialEggInterval;
    }
    shuffle(allNumbers);

    for(const [key,data] of Object.entries(SPECIAL_EGGS))
    {
        const freq = data.freq ?? CONFIG.generation.defaultFrequencies.specialEgg;
        for(let i = 0; i < freq; i++)
        {
            const num = allNumbers.pop();
            tiles.push(new Tile(TileType.SPECIAL, key, num));
        }
    }
}

const generatePowerEggs = (tiles) =>
{
    if(!CONFIG.sets.powers) { return; }

    for(const [key,data] of Object.entries(POWERS))
    {
        tiles.push(new Tile(TileType.POWER, key));
    }

    for(const [key,data] of Object.entries(HANDICAPS))
    {
        tiles.push(new Tile(TileType.HANDICAP, key));
    }
}