import { EGGS_SHARED } from "games/easter-eggventures/shared/dictShared";
import CONFIG from "../shared/config";
import { TileType } from "../shared/dict";
import Tile from "./tile";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class EggPicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];
        
        if(CONFIG.sets.base)
        {
            const maxNumEggs = CONFIG.generation.maxNumEggs;
            const eggTypes = Object.keys(EGGS_SHARED).slice(0, maxNumEggs);
    
            for(const key of eggTypes)
            {
                const data = EGGS_SHARED[key];
                const freq = (data.freq ?? CONFIG.generation.defaultFrequencies.eggToken) ?? 6;
    
                for(let i = 0; i < freq; i++)
                {
                    this.tiles.push(new Tile(TileType.EGG, key))
                }
            }
        }

        if(CONFIG.sets.score)
        {
            for(const [num,freq] of Object.entries(CONFIG.generation.victoryEggsDistribution))
            {
                for(let i = 0; i < (freq as number); i++)
                {
                    this.tiles.push(new Tile(TileType.EGG, "victory", { num: parseInt(num) }));
                }
            }
        }

        console.log(this.tiles);
    }
}