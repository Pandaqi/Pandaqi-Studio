
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
    DESERT = "desert",
    WILDCARD = "wildcard"
}

enum DinoType
{
    EGG = "egg", // neutral egg that will hatch into a dinosaur LATER
    TRI = "tri", // triceratops; thorny carnivore
    BRACHIO = "brachio", // brachiosaurus; long-necked herbivore
    VELO = "velo", // velociraptor
    STEGO = "stego", // stegosaurus; ankylosaurus another option
    WILDCARD = "wildcard"
}

interface GeneralData
{
    frame?: number,
    sets?: string[],
    needsArrow?: boolean,
    desc?: string
}

const TERRAINS:Record<TerrainType, GeneralData> = 
{
    [TerrainType.GRASS]: { frame: 0, sets: ["base", "expansion"] },
    [TerrainType.STONE]: { frame: 1, sets: ["base", "expansion"] },
    [TerrainType.WATER]: { frame: 2, sets: ["base", "expansion"] },
    [TerrainType.LAVA]: { frame: 3, sets: ["base", "expansion"] },
    [TerrainType.DESERT]: { frame: 4, sets: ["expansion"] },
    [TerrainType.WILDCARD]: { frame: 5, sets: ["expansion"] }
}

const DINOS:Record<DinoType, GeneralData> =
{
    [DinoType.EGG]: { frame: 0, sets: ["base", "expansion"], desc: "Hatches when Egg Hatch on top of asteroid deck." },
    [DinoType.TRI]: { frame: 1, sets: ["base", "expansion"], desc: "Move crosshairs in direction of arrow.", needsArrow: true },
    [DinoType.BRACHIO]: { frame: 2, sets: ["base"], desc: "Look at the next 5 asteroid tiles." },
    [DinoType.VELO]: { frame: 3, sets: ["base", "expansion"], desc: "Discard the top asteroid tile." },
    [DinoType.STEGO]: { frame: 4, sets: ["expansion"], desc: "Look at or Replace any player's hand." },
    [DinoType.WILDCARD]: { frame: 5, sets: ["expansion"], desc: "Can be any dinosaur you want!" }
}

const MISC:Record<string, GeneralData> =
{
    arrow: { frame: 0 },
    asteroid_crosshairs: { frame: 1 },
    asteroid_tile: { frame: 2 },
    asteroid_egg_hatch: { frame: 3 }
}

export 
{
    TERRAINS,
    DINOS,
    MISC,
    DinoType,
    DominoType,
    TerrainType,
    TileType
}