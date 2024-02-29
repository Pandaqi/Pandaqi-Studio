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

interface TileData
{
    frame?: number,
    label?: string,
    desc?: string,
    freq?: number,
    color?: string,
    invertContrast?: boolean,
    set?: string,
}

type TileDataDict = Record<string,TileData>;

const EGGS:TileDataDict =
{
    red: { frame: 0, color: "#E61948", invertContrast: true },
    green: { frame: 1, color: "#3CB44B", invertContrast: true },
    yellow: { frame: 2, color: "#FFE119" },
    blue: { frame: 3, color: "#4363D8", invertContrast: true },
    orange: { frame: 3, color: "#F58231", invertContrast: true },
    cyan: { frame: 3, color: "#42D4F4" },
    magenta: { frame: 3, color: "#F032E6", invertContrast: true },
    pink: { frame: 3, color: "#FABED4" },
}

const MISC = 
{
    bg_pattern_0: { frame: 0 },
    bg_pattern_1: { frame: 1 },
    bg_pattern_2: { frame: 2 },
    bg_pattern_3: { frame: 3 },
    gradient: { frame: 4 },
    lightrays: { frame: 5 },
    number_bg: { frame: 6 },
    text_bg: { frame: 7 }
}

const MAP_TILES:TileDataDict =
{

}

/*
Example: at tile type X, next to tile type X, in row/column X, on a tile with X other players, next to a tile with a player, 

All of these can be INVERTED?
*/
const RULES:TileDataDict =
{

}

const ACTION_TILES:TileDataDict =
{

}

/*
 (Example: "Collect at least 5 Blue or Red eggs for +5 points" or "-5 points if you have more than 3 eggs of the same type")
*/
const SECRET_OBJECTIVES:TileDataDict =
{

}

const MATERIAL:Record<TileType, TileDataDict> = 
{
    [TileType.EGG]: EGGS,
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
    EGGS,
    MAP_TILES,
    RULES,
    ACTION_TILES,
    SECRET_OBJECTIVES,
    MISC,
    TileType,
    MATERIAL,
    TYPE_DATA
}
