import CONFIG from "../js_shared/config";
import { TILE_TYPES } from "../js_shared/dict";
import Tile from "./tile";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles; }

    generate()
    {
        this.tiles = [];

        for(const [key,data] of Object.entries(TILE_TYPES))
        {
            const numEmpty = data.numEmpty ?? CONFIG.generation.defaultNumEmpty;
            const numSheep = data.numSheep ?? CONFIG.generation.defaultNumSheep;
            const arr = new Array(numEmpty).fill(0).concat(new Array(numSheep).fill(1));

            for(const numSheepOnTile of arr)
            {
                const newTile = new Tile(key, numSheepOnTile);
                this.tiles.push(newTile);
            }

            const numWolf = CONFIG.expansions.wolf ? (data.numWolf ?? CONFIG.generation.defaultNumWolf) : 0;
            for(let i = 0; i < numWolf; i++)
            {
                const newTile = new Tile(key);
                newTile.wolf = true;
                this.tiles.push(newTile);
            }

            const numPlayer = data.numPlayer ?? CONFIG.generation.numPlayers;
            for(let i = 0; i < numPlayer; i++)
            {
                const newTile = new Tile(key, 1, i);
                this.tiles.push(newTile);
            }
        }
    }
}