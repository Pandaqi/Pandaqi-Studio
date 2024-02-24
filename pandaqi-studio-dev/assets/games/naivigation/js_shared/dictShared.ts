enum CardType
{
    VEHICLE = "vehicle",
    HEALTH = "health",
    GPS = "gps",
    TIME = "time",
    COMPASS = "compass",
    INSTRUCTION = "instruction",
    ACTION = "action",
    CUSTOM = "custom"
}

enum TileType
{
    MAP = "map",
    VEHICLE = "vehicle"
}

enum EventType
{
    NONE = "none",
    EVENT = "event",
    OFFER = "offer",
    RULE = "rule"
}

const TERRAINS = 
{
    sea: { frame: 0, elevation: 0 },
    grass: { frame: 1, elevation: 1 },
    desert: { frame: 2, elevation: 1 },
    forest: { frame: 3, elevation: 2 },
    something: { frame: 4, elevation: 2 }, // @TODO
    city: { frame: 5, elevation: 3 },
    something2: { frame: 6, elevation: 3 }, // @TODO
    mountain: { frame: 7, elevation: 4 },
}

const GPS_ICONS = 
{
    reward: { frame: 8 },
    penalty: { frame: 9 },
    arrow: { frame: 10 }
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

export
{
    CardType,
    TileType,
    EventType,
    MaterialNaivigationType,
    TERRAINS,
    MISC_SHARED,
    GPS_ICONS
}