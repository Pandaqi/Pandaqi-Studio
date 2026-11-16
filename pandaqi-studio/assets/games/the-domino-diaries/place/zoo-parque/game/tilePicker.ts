import { getSetting } from "lib/pq-games";
import { CONFIG } from "../shared/config";
import { ANIMALS, AnimalType } from "../shared/dict";
import Tile from "./tile";

export const tilePicker = () : Tile[] =>
{
    if(!getSetting("sets.passports", CONFIG)) { return; }

    const tiles = [];
    
    for(const [key,data] of Object.entries(ANIMALS))
    {
        tiles.push( new Tile(key as AnimalType) );
    }

    return tiles;
}