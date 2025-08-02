import { CONFIG } from "../shared/config";
import { ROOMS, TileType } from "../shared/dict";
import Tile from "./tile";

export const tilePicker = () : Tile[] =>
{
    const tiles = [];

    generatePawns(tiles);
    generateRoomTiles(tiles);

    return tiles;
}

const generatePawns = (tiles) =>
{
    if(!CONFIG.sets.base) { return; }

    const maxNumPlayers = CONFIG.generation.maxNumPlayers;
    for(let i = 0; i < maxNumPlayers; i++)
    {
        tiles.push(new Tile(TileType.PAWN, "", { playerNum: i }));
    }
}

const generateRoomTiles = (tiles) =>
{
    for(const [key,data] of Object.entries(ROOMS))
    {
        const set = data.set ?? "base";
        if(!CONFIG.sets[set]) { continue; }

        const freq = data.freq ?? CONFIG.generation.defaultFrequencies.roomTile;
        for(let i = 0; i < freq; i++)
        {
            tiles.push(new Tile(TileType.ROOM, key));
        }
    }
}