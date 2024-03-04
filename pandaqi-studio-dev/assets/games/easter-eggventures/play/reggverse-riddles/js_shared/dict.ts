import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/js_shared/dictShared";
import Bounds from "js/pq_games/tools/numbers/bounds";

enum TileType
{
    EGG = "egg",
    MAP = "map",
    RULE = "rule",
    PAWN = "pawn",
    ACTION = "action",
    OBJECTIVE = "objective"
}

const MAP_TILES:TileDataDict =
{
    empty: { frame: 0 },
    tree: { frame: 1 },
    cave: { frame: 2 },
    dragon: { frame: 3 },
    well: { frame: 4 },
    witch: { frame: 5 },
    statue: { frame: 6 },
    tower: { frame: 7 },
}

/*
Example: at tile type X, next to tile type X, in row/column X, on a tile with X other players, next to a tile with a player, 
Example: "next to a tile with Blue egg" or "next to a tile with 2 or more eggs"

All of these can be INVERTED? (Prefer not to, though, as that is hard to handle for players.)
*/
const RULES:TileDataDict =
{

}

const ACTION_TILES:TileDataDict =
{

}

/*
(Example: "Collect at least 5 Blue or Red eggs for +5 points" or "-5 points if you have more than 3 eggs of the same type")
This has only ONE icon (of a target or secret file or something), reused everywhere because these all have the same "frame" = 0
 */
const SECRET_OBJECTIVES:TileDataDict =
{

}

const MATERIAL:Record<TileType, TileDataDict> = 
{
    [TileType.EGG]: EGGS_SHARED,
    [TileType.MAP]: MAP_TILES,
    [TileType.RULE]: RULES,
    [TileType.PAWN]: {},
    [TileType.ACTION]: ACTION_TILES,
    [TileType.OBJECTIVE]: SECRET_OBJECTIVES,
}

interface TileTypeData
{
    textureKey: string,
    backgroundKey: string,
    label: string,
    color?: string,
    backgroundRandom?: Bounds // selects one of its frames from the background spritesheet at random 
}

const TYPE_DATA:Record<TileType, TileTypeData> =
{
    [TileType.EGG]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Points Egg" },
    [TileType.MAP]: { textureKey: "special_eggs", backgroundKey: "misc", label: "Special Egg", backgroundRandom: new Bounds(0,3) },
    [TileType.RULE]: { textureKey: "obstacles", backgroundKey: "misc", label: "Obstacle", backgroundRandom: new Bounds(0,3) },
    [TileType.PAWN]: { textureKey: "", backgroundKey: "", label: "Player Pawn" },
    [TileType.ACTION]: { textureKey: "", backgroundKey: "", label: "Action Tile" },
    [TileType.OBJECTIVE]: { textureKey: "", backgroundKey: "", label: "Secret Challenge" }, 
}

export 
{
    MAP_TILES,
    RULES,
    ACTION_TILES,
    SECRET_OBJECTIVES,
    TileType,
    MATERIAL,
    TYPE_DATA
}
