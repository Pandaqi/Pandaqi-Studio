import { EGGS_SHARED } from "games/easter-eggventures/js_shared/dictShared";
import CONFIG from "../js_shared/config";
import { OBSTACLES, SPECIAL_EGGS, TileType } from "../js_shared/dict";
import Tile from "./tile";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class TilePicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];

        this.generatePawns();
        this.generateEggs();
        this.generateSpecialEggs();
        this.generateObstacles();

        console.log(this.tiles);
    }

    generatePawns()
    {
        const maxNumPlayers = CONFIG.generation.maxNumPlayers;
        for(let i = 0; i < maxNumPlayers; i++)
        {
            this.tiles.push(new Tile(TileType.PAWN, "", i));
        }
    }

    generateEggs()
    {
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
                this.tiles.push(new Tile(TileType.EGG, key, num));
            }
        }
    }

    generateSpecialEggs()
    {
        if(!CONFIG.sets.specialEggs) { return; }

        for(const [key,data] of Object.entries(SPECIAL_EGGS))
        {
            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.specialEgg;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.SPECIAL, key));
            }
        }
    }

    generateObstacles()
    {
        for(const [key,data] of Object.entries(OBSTACLES))
        {
            const set = data.set ?? "base";
            if(!CONFIG.sets[set]) { continue; }

            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.obstacle;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.OBSTACLE, key));
            }
        }
    }
}