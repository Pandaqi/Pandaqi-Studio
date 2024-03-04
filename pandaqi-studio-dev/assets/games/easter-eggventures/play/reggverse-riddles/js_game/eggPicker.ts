import { EGGS_SHARED } from "games/easter-eggventures/js_shared/dictShared";
import CONFIG from "../js_shared/config";
import { TileType } from "../js_shared/dict";
import Tile from "./tile";

export default class EggPicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];

        let counter = 0;
        const maxNumEggs = CONFIG.generation.maxNumEggs;
        for(const [key,data] of Object.entries(EGGS_SHARED))
        {
            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.eggToken;

            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.EGG, key))
            }

            counter++;
            if(counter >= maxNumEggs) { break; }
        }

        console.log(this.tiles);
    }
}