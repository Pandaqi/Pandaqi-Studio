import shuffle from "js/pq_games/tools/random/shuffle";
import CONFIG from "../shared/config";
import { TILE_TYPES } from "../shared/dict";
import Tile from "./tile";
import getWeighted from "js/pq_games/tools/random/getWeighted";

export default class TilePicker
{
    tiles: Tile[]

    constructor() {}
    get() { return this.tiles; }

    generate()
    {
        this.tiles = [];

        const specialTypes = shuffle(CONFIG.generation.defaultSpecialAllowed.slice());
        let specialTypeIndex = 0;

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

            // this _cycles_ through all special types, to make sure they're fairly distributed
            // across all fence configurations
            const numSpecial = CONFIG.expansions.wolf ? (data.numSpecial ?? CONFIG.generation.defaultNumSpecial) : 0;
            const specialAllowed = data.allowedSpecial ?? CONFIG.generation.defaultSpecialAllowed;
            for(let i = 0; i < numSpecial; i++)
            {
                const newTile = new Tile(key);
                let curType;
                for(let a = 0; a < specialTypes.length; a++) {
                    specialTypeIndex = (specialTypeIndex + 1) % specialTypes.length;
                    curType = specialTypes[specialTypeIndex];
                    if(specialAllowed.includes(curType)) { break; }
                }

                newTile.special = curType;
                this.tiles.push(newTile);
            }

            const numPlayer = data.numPlayer ?? CONFIG.generation.numPlayers;
            for(let i = 0; i < numPlayer; i++)
            {
                const newTile = new Tile(key, 1, i);
                this.tiles.push(newTile);
            }
        }

        const numRandom = CONFIG.generation.numRandomExtra;
        const randomExtras = CONFIG.generation.randomExtras;
        for(let i = 0; i < numRandom; i++)
        {
            const key = getWeighted(randomExtras);
            const sheep = Math.random() <= 0.5 ? 1 : 0;
            const newTile = new Tile(key, sheep);
            this.tiles.push(newTile);
        }
    }
}