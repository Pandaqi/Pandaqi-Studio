
enum DominoType
{
    REGULAR = "regular",
    PAWN = "pawn"
}

enum ItemType
{
    ANIMAL = "animal",
    STALL = "stall",
    OBJECT = "object",
    PATH = "path",
    EMPTY = "empty"
}

// @TODO: the issue is that many animals are SAVANNAH/STEPPE which is a mix between Grass and Desert
// @TODO: Perhaps swamp-like terrain? Don't really see clear animals that would use it, though

enum TerrainType
{
    GRASS = "grass", // grassland, farmland, hills, temperate
    WATER = "water", // anything ocean or water-related (marine, freshwater, ice, ...)
    JUNGLE = "jungle", // rainforest, general forest and equator climates
    TUNDRA = "tundra", // cold, stoney, high-altitudes
    DESERT = "desert", // pretty self-explanatory
}

enum AnimalType
{
    LION = "lion", // in the category: TIGER / JAGUAR / CHEETAH
    POLARBEAR = "polarbear",
    WOLF = "wolf",
    DOLPHIN = "dolphin",
    PANDA = "panda",
    GIRAFFE = "giraffe",
    ELEPHANT = "elephant",
    BEAR = "bear",
    CROCODILE = "crocodile",
    OKAPI = "okapi", // in the category: DEER / GEMSBOK / IBEX / MOOSE / OKAPI / THOMSON'S GAZELLE
}

enum AnimalDiet
{
    HERBI = "herbivore",
    CARNI = "carnivore",
}

enum AnimalSocial
{
    SOLITARY = "solitary",
    HERD = "herd"
}

interface AnimalDetailData
{
    frame: number,
    strong?: boolean,
    value?: number,
    food?: number,
    diet?: AnimalDiet,
    social?: AnimalSocial,
    terrains?: TerrainType[],
    sets?: string[]
}

/*

OTHER ANIMALS (potentially)

ZEBRA
CHIMPANZEE / RING-TAILED LEMUR
CAMEL
HIPPOPOTAMUS
KANGAROO
RED PANDA
SEA LION / TURTLE / SHARK / ORCA / WALRUS / MANTA RAY / SEA OTTER

A reptile still, like a salamander?

*/

const ANIMALS:Record<AnimalType, AnimalDetailData> =
{
    [AnimalType.LION]: { frame: 0, value: 1, strong: true, food: 1.5, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.DESERT, TerrainType.GRASS], sets: ["base", "strong"] },
    [AnimalType.POLARBEAR]: { frame: 1, value: 2, strong: true, food: 2.0, diet: AnimalDiet.CARNI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.WATER, TerrainType.TUNDRA], sets: ["strong","utilities"] },
    [AnimalType.WOLF]: { frame: 2, value: 1, food: 1.0, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.JUNGLE, TerrainType.TUNDRA], sets: ["strong","wildlife"] },
    [AnimalType.DOLPHIN]: { frame: 3, value: 1, food: 1.0, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.WATER], sets: ["base", "wildlife"] },
    [AnimalType.PANDA]: { frame: 4, value: 1, food: 0.5, diet: AnimalDiet.HERBI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.JUNGLE], sets: ["base", "wildlife"] },
    [AnimalType.GIRAFFE]: { frame: 5, value: 1, food: 0.5, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.DESERT], sets: ["base","wildlife"] },
    [AnimalType.ELEPHANT]: { frame: 6, value: 1, strong: true, food: 2.0, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.DESERT], sets: ["base", "strong"] },
    [AnimalType.BEAR]: { frame: 7, value: 1, food: 1.5, diet: AnimalDiet.CARNI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.JUNGLE], sets: ["base", "utilities"] },
    [AnimalType.CROCODILE]: { frame: 8, value: 1, food: 1.0, diet: AnimalDiet.CARNI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.DESERT, TerrainType.WATER], sets: ["base", "wildlife"] },
    [AnimalType.OKAPI]: { frame: 9, value: 1, food: 0.5, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.JUNGLE, TerrainType.TUNDRA, TerrainType.DESERT], sets: ["base", "utilities"] }
    // @TODO: add DINO or DODO or some other extinct species (sabre-toothed tiger), which can only be placed if your zoo has a research lab or something (part of utilities expansion)
}

interface GeneralData
{
    frame: number,
    desc?: string,
    value?: number,
    sets?: string[]
}

const STALLS:Record<string, GeneralData> =
{
    toilet: { frame: 0, value: 1, sets: ["utilities"] },
    photo_booth: { frame: 1, value: 2, sets: ["utilities"] },
    gift_shop: { frame: 2, value: 2, sets: ["utilities"] },
    playground: { frame: 3, value: 3, sets: ["utilities"] },
    information_center: { frame: 4, value: 4, sets: ["utilities"] },
    research_lab: { frame: 5, value: 4, sets: ["utilities"] }, // or breeding lab => something about unlocking other animal species so they can be played or something??
    restaurant: { frame: 6, value: 3, sets: ["utilities"] },
}

const OBJECTS:Record<string, GeneralData> =
{
    food: { frame: 0, value: 0.25, sets: ["base", "wildlife", "strong", "utilities"] },
    toys: { frame: 1, value: 1, desc: "@TODO", sets: ["wildlife"] },
    tree: { frame: 2, value: 0.5, desc: "@TODO", sets: ["wildlife"] },
    shrubs: { frame: 3, value: 1, desc: "@TODO", sets: ["wildlife"] },
    rocks: { frame: 4, value: 2, desc: "@TODO", sets: ["strong"] },
    shelter: { frame: 5, value: 2, desc: "@TODO", sets: ["utilities"] },
    camera: { frame: 6, value: 2, desc: "@TODO", sets: ["utilities"] }, // these would be INSIDE exhibits to track/look up close
}

const TERRAINS:Record<TerrainType, GeneralData> =
{
    [TerrainType.GRASS]: { frame: 0, value: 1, sets: ["base"] },
    [TerrainType.WATER]: { frame: 1, value: 2, sets: ["base"] },
    [TerrainType.JUNGLE]: { frame: 2, value: 3, sets: ["base"] },
    [TerrainType.TUNDRA]: { frame: 3, value: 3, sets: ["strong"] },
    [TerrainType.DESERT]: { frame: 4, value: 3, sets: ["wildlife"] },
}

const ITEMS:Record<ItemType,any> =
{
    [ItemType.ANIMAL]: ANIMALS,
    [ItemType.STALL]: STALLS,
    [ItemType.OBJECT]: OBJECTS,
    [ItemType.PATH]: { path: { value: 0.33 } },
    [ItemType.EMPTY]: { empty: { value: 0.33 } }
}

const MISC =
{
    fence_weak: { frame: 0 },
    fence_strong: { frame: 1 },
    path: { frame: 2 }
}

export
{
    MISC,
    ANIMALS,
    STALLS,
    OBJECTS,
    ITEMS,
    TERRAINS,
    DominoType,
    AnimalType,
    TerrainType,
    ItemType
}