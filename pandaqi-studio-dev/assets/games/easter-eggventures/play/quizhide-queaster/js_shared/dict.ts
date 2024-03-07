import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/js_shared/dictShared";
import Bounds from "js/pq_games/tools/numbers/bounds";

enum TileType
{
    EGG = "egg",
    PAWN = "pawn",
    ROOM = "room",
    OBSTACLE = "obstacle"
}

enum CardType
{
    CLUE = "clue",
    SCORE = "score",
}

type MaterialType = TileType|CardType;

// Do we need this dictionary? YES. To assign the possible _slots_ of the room.
const ROOMS:TileDataDict =
{
    bedroom: { frame: 0 },
    bathroom: { frame: 1 },
    gym: { frame: 2 },
    office: { frame: 3 },
    dining_room: { frame: 4 },
    living_room: { frame: 5 },
    play_room: { frame: 6 },
    library: { frame: 7 },

    basement: { frame: 8 },
    attic: { frame: 9 },
    toilet: { frame: 10 },
    home_theatre: { frame: 11 },
    foyer: { frame: 12 },
    kitchen: { frame: 13 },
    laundry_room: { frame: 14 },
    storage: { frame: 15 },
}

const OBSTACLES:TileDataDict =
{

}

const MATERIAL:Record<MaterialType, TileDataDict> = 
{
    [TileType.EGG]: EGGS_SHARED,
    [TileType.ROOM]: ROOMS,
    [TileType.PAWN]: {},
    [TileType.OBSTACLE]: OBSTACLES,
    [CardType.CLUE]: {},
    [CardType.SCORE]: {},
}

interface TileTypeData
{
    textureKey: string,
    backgroundKey: string,
    label: string,
    color?: string,
    backgroundRandom?: Bounds // selects one of its frames from the background spritesheet at random 
}

const TYPE_DATA:Record<MaterialType, TileTypeData> =
{
    [TileType.EGG]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Egg Token" },
    [TileType.ROOM]: { textureKey: "rooms", backgroundKey: "", label: "Room Tile" },
    [TileType.PAWN]: { textureKey: "", backgroundKey: "", label: "Player Pawn" },
    [TileType.OBSTACLE]: { textureKey: "objects", backgroundKey: "", label: "Object" },
    [CardType.CLUE]: { textureKey: "clue_cards", backgroundKey: "", label: "Clue Card" },
    [CardType.SCORE]: { textureKey: "", backgroundKey: "", label: "Score Card" },
}

export 
{
    ROOMS,
    TileType,
    CardType,
    MATERIAL,
    TYPE_DATA
}
