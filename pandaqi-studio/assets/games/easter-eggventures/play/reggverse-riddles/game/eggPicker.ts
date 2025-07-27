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
        if(!CONFIG.sets.base) { return; }

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
                this.tiles.push(new Tile(TileType.EGG, key))
            }
        }

        console.log(this.tiles);
    }
}