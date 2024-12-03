enum CardType
{
    VEHICLE = "vehicle",
    HEALTH = "health",
    GPS = "gps",
    TIME = "time",
    COMPASS = "compass",
    INSTRUCTION = "instruction",
    ACTION = "action",
    PASSENGER = "passenger",
    FUEL = "fuel",
    CUSTOM = "custom",
}

enum TileType
{
    MAP = "map",
    VEHICLE = "vehicle-tile",
    PAWN = "pawn",
    CUSTOM = "custom-tile"
}

enum EventType
{
    NONE = "none",
    EVENT = "event",
    OFFER = "offer",
    RULE = "rule"
}

enum TerrainType
{
    NONE = "none",
    SEA = "sea",
    GRASS = "grass",
    DESERT = "desert",
    FOREST = "forest",
    TUNDRA = "tundra",
    CITY = "city",
    ROCK = "rock", // or "plateau" or something
    MOUNTAIN = "mountain"
}

interface TerrainData 
{
    frame: number,
    elevation: number
}

const TERRAINS:Record<TerrainType, TerrainData> = 
{
    [TerrainType.NONE]: { frame: -1, elevation: -1 },
    [TerrainType.SEA]: { frame: 0, elevation: 0 },
    [TerrainType.GRASS]: { frame: 1, elevation: 1 },
    [TerrainType.DESERT]: { frame: 2, elevation: 1 },
    [TerrainType.FOREST]: { frame: 3, elevation: 2 },
    [TerrainType.TUNDRA]: { frame: 4, elevation: 2 },
    [TerrainType.CITY]: { frame: 5, elevation: 3 },
    [TerrainType.ROCK]: { frame: 6, elevation: 3 },
    [TerrainType.MOUNTAIN]: { frame: 7, elevation: 4 },
}

const GPS_ICONS = 
{
    reward: { frame: 9 },
    penalty: { frame: 10 },
    arrow: { frame: 11 }
}

const PASSENGERS =
{
    girl: { frame: 0, label: "Tiara Train" }, // Daisy Green
    boy: { frame: 1, label: "Timmy Taxi" }, // Jim Red
    woman: { frame: 2, label: "Claire Car" }, // Ms. Sparkle
    man: { frame: 3, label: "Simon Ship" }, // Mr. Grumpy
    grandma: { frame: 4, label: "Boris Boat" }, // John Johnson
    grandpa: { frame: 5, label: "Rachel Rocket" }, // Ann Annie
    woman_young: { frame: 6, label: "Bella Bus" },
    man_young: { frame: 7, label: "Peter Plane" }
}

const MISC_SHARED =
{
    game_icon: { frame: 0 },
    game_pattern: { frame: 1 },
    vehicle_guides: { frame: 2 },
    collectible_icon: { frame: 3 },
    starting_icon: { frame: 4 },
}

type MaterialNaivigationType = CardType | TileType

interface MaterialNaivigationData
{
    frame?: number,
    label?: string,
    subText?: string,
    num?: number,
    desc?: string,
    freq?: number,
    prob?: number,
    shared?: boolean, // true if part of shared material
    collectible?: boolean, // true if one of the 5 collectibles of each Naivigation game
    starting?: boolean, // true if the starting tile image
    vehicle?: boolean, // true if a vehicle pawn
    sets?: string[] // the set(s) to which this thing belongs; if one matches, we use it
    required?: string[], // required sets to be selected in shared material for this to generate; ALL must match to use it
    type?: any
}

interface GameNaivigationData
{
    bgColor?: string,
    tintColor?: string,
    textColor?: string,
    mapTileColor?: string,
}

export
{
    CardType,
    TileType,
    EventType,
    MaterialNaivigationType,
    MaterialNaivigationData,
    GameNaivigationData,
    TERRAINS,
    TerrainType,
    PASSENGERS,
    MISC_SHARED,
    GPS_ICONS
}