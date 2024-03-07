import { OBSTACLES } from "../../egghunt-esports/js_shared/dict";
import CONFIG from "../js_shared/config";
import { ROOMS, TileType } from "../js_shared/dict";
import Tile from "./tile";

export default class TilePicker
{
    tiles: Tile[]

    get() { return this.tiles.slice(); }
    generate()
    {
        this.tiles = [];

        this.generatePawns();
        this.generateRoomTiles();
        this.generateObstacles();

        console.log(this.tiles);
    }

    generatePawns()
    {
        const maxNumPlayers = CONFIG.generation.maxNumPlayers;
        for(let i = 0; i < maxNumPlayers; i++)
        {
            this.tiles.push(new Tile(TileType.PAWN, "", { playerNum: i }));
        }
    }

    generateRoomTiles()
    {
        for(const [key,data] of Object.entries(ROOMS))
        {
            const set = data.set ?? "base";
            if(!CONFIG.sets[set]) { continue; }

            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.roomTile;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.ROOM, key));
            }
        }
    }

    generateObstacles()
    {
        for(const [key,data] of Object.entries(OBSTACLES))
        {
            const set = data.set ?? "base";
            if(!CONFIG.sets[set]) { continue; }

            const freq = data.freq ?? CONFIG.generation.defaultFrequencies.obstacleTile;
            for(let i = 0; i < freq; i++)
            {
                this.tiles.push(new Tile(TileType.OBSTACLE, key));
            }
        }
    }


}