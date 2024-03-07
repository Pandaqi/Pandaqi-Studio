import { EGGS_SHARED } from "games/easter-eggventures/js_shared/dictShared";
import CONFIG from "../js_shared/config";
import { TileType } from "../js_shared/dict";
import Tile from "./tile";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class EggPicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];

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
                this.tiles.push(new Tile(TileType.EGG, key))
            }
        }

        console.log(this.tiles);
    }
}