import shuffle from "js/pq_games/tools/random/shuffle";
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
    }
}