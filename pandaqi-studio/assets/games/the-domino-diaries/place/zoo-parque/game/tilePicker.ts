import { CONFIG } from "../shared/config";
import { ANIMALS, AnimalType } from "../shared/dict";
import Tile from "./tile";

export default class TilePicker
{
    tiles: Tile[] = [];

    constructor() {}
    get() { return this.tiles.slice(); }
    async generate()
    {
        if(!CONFIG.sets.passports) { return; }

        this.tiles = [];
        
        for(const [key,data] of Object.entries(ANIMALS))
        {
            this.tiles.push( new Tile(key as AnimalType) );
        }

        console.log(this.tiles);
    }
}