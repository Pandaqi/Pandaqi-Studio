enum CardType
{
    VEHICLE = "vehicle",
    HEALTH = "health",
    GPS = "gps",
    TIME = "time",
    COMPASS = "compass",
    INSTRUCTION = "instruction",
    ACTION = "action"
}

enum TileType
{
    MAP = "map",
    VEHICLE = "vehicle"
}

type MaterialNaivigationType = CardType | TileType

export
{
    CardType,
    TileType,
    MaterialNaivigationType
}