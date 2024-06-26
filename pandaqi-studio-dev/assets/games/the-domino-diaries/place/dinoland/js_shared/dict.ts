
enum DominoType
{
    REGULAR = "regular",
    PAWN = "pawn",
}

enum TileType
{
    ASTEROID = "asteroid",
    CROSSHAIR = "crosshair",
    EGGHATCH = "egghatch"
}

enum TerrainType
{
    GRASS = "grass",
    STONE = "stone",
    WATER = "water",
    LAVA = "lava",
    DESERT = "desert"
}

enum DinoType
{
    EGG = "egg", // neutral egg that will hatch into a dinosaur LATER
    TRI = "tri", // triceratops; thorny carnivore
    BRACHIO = "brachio", // brachiosaurus; long-necked herbivore
    VELO = "velo", // velociraptor
    STEGO = "stego", // stegosaurus; ankylosaurus another option
}

const TERRAINS = 
{
    [TerrainType.GRASS]: { frame: 0, sets: ["base", "expansion"] },
    [TerrainType.STONE]: { frame: 1, sets: ["base", "expansion"] },
    [TerrainType.WATER]: { frame: 2, sets: ["base", "expansion"] },
    [TerrainType.LAVA]: { frame: 3, sets: ["base"] },
    [TerrainType.DESERT]: { frame: 4, sets: ["expansion"] }
}

const DINOS =
{
    [DinoType.EGG]: { frame: 0, sets: ["base", "expansion"] },
    [DinoType.TRI]: { frame: 1, sets: ["base", "expansion"] },
    [DinoType.BRACHIO]: { frame: 2, sets: ["base", "expansion"] },
    [DinoType.VELO]: { frame: 3, sets: ["base"] },
    [DinoType.STEGO]: { frame: 4, sets: ["expansion"] },
}

export 
{
    TERRAINS,
    DINOS,
    DinoType,
    DominoType,
    TerrainType,
    TileType
}