import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../js_shared/config";
import { EGGS, HANDICAPS, POWERS, SPECIAL_EGGS, TileType } from "../js_shared/dict";
import Tile from "./tile";

export default class TilePicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];

        this.generateRegularEggs();
        this.generateSpecialEggs();
        this.generatePowerEggs();

        console.log(this.tiles);
    }

    generateRegularEggs()
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
        let counter = 0;

        for(const [key,data] of Object.entries(EGGS))
        {
            // the tiles with which we play
            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.regularEgg;
            for(let i = 0; i < freq; i++)
            {
                const num = allNumbers.pop();
                this.tiles.push(new Tile(TileType.REGULAR, key, num));
            }

            // the goal tiles
            this.tiles.push(new Tile(TileType.GOAL, key));
            
            counter++;
            if(counter >= numUniqueEggs) { break; }
        }
    }

    generateSpecialEggs()
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
                this.tiles.push(new Tile(TileType.SPECIAL, key, num));
            }
        }
    }

    generatePowerEggs()
    {
        if(!CONFIG.sets.powers) { return; }

        for(const [key,data] of Object.entries(POWERS))
        {
            this.tiles.push(new Tile(TileType.POWER, key));
        }

        for(const [key,data] of Object.entries(HANDICAPS))
        {
            this.tiles.push(new Tile(TileType.HANDICAP, key));
        }
    }
}