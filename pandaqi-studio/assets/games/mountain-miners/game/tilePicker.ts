import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import { CONFIG } from "../shared/config";
import { TILES } from "../shared/dict";
import Tile from "./tile";
import shuffle from "js/pq_games/tools/random/shuffle";

export const tilePicker = () : Tile[] =>
{
    const tiles = [];

    // the crucial arrow tiles
    if(CONFIG.sets.base)
    {
        for(let i = 0; i < CONFIG.tiles.generation.numArrowTiles; i++)
        {
            tiles.push(new Tile("arrow"));
        }
    }

    // then all remaining tiles
    // first we collect all the types we want in a list, we actually create the tiles in a separate loop
    // why? because the Gemshards expansion can handle 1--4 icons per tile, while base game only does 1
    const typesNeeded = [];
    for(const [key,data] of Object.entries(TILES))
    {
        const setIncluded = CONFIG.sets[data.set ?? "base"];
        if(!setIncluded) { continue; }

        let freq = data.freq ?? CONFIG.tiles.generation.defFreq;
        if(data.points) { freq = CONFIG.tiles.generation.numTilesPerGemstoneValue[data.points] ?? freq; }

        for(let i = 0; i < freq; i++)
        {
            typesNeeded.push(key);
        }
    }

    shuffle(typesNeeded);
    
    const allowMultiTiles = CONFIG.sets.gemShards;
    while(typesNeeded.length > 0)
    {
        let num = allowMultiTiles ? rangeInteger(1,4) : 1;
        num = Math.min(num, typesNeeded.length);            

        const keys = typesNeeded.splice(0, num);
        tiles.push(new Tile(keys));
    }

    return tiles;
}