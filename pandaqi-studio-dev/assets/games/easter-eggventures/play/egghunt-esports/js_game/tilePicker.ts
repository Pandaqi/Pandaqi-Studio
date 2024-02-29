import CONFIG from "../js_shared/config";
import { EGGS, OBSTACLES, SPECIAL_EGGS, TileType } from "../js_shared/dict";
import Tile from "./tile";

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
        let counter = 0;
        const maxNumEggs = CONFIG.generation.maxNumEggs;
        const numbers = CONFIG.generation.defaultEggNumbering.slice();

        for(const [key,data] of Object.entries(EGGS))
        {
            for(const num of numbers)
            {
                this.tiles.push(new Tile(TileType.EGG, key, num));
            }

            counter++;
            if(counter >= maxNumEggs) { break; }
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
            if(!CONFIG.sets[data.set]) { continue; }

            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.obstacle;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.OBSTACLE, key));
            }
        }
    }
}