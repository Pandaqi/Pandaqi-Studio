
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
    WILDCARD = "wildcard"
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
    LEMUR = "lemur",
    CAMEL = "camel",
    KANGAROO = "kangaroo",
    REDPANDA = "redpanda",
    OTTER = "otter", // sea otter
    DINO = "dino"
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
    sets?: string[],
    extinct?: boolean,
    funFact?: string,
    power?: string,
}

// @NOTE: All animals need to support at least one terrain type that is in their set/expansion
// => The "base" set has Grass, Water and Jungle
// => The "strong" expansion focuses on Tundra and Grass
// => The "wildlife" expansion focuses on Water and Desert
// => The "utilities" animals all support TerrainType.WILDCARD (though this is not DISPLAYED on their passport, of course)

// OLD FUNFACT + POWER for HIPPO: funFact: "Hippos produce their own sunblock, can hold their breath for 5 minutes, and know friend from foe by smelling poop.", power: "<b>Permanent</b>: <b>can't</b> be placed adjacent to an Object or Stall."

const ANIMALS:Record<AnimalType, AnimalDetailData> =
{
    [AnimalType.LION]: { frame: 0, value: 1, strong: true, food: 2, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.DESERT, TerrainType.GRASS], sets: ["base", "strong"], funFact: "Lions are the only cats to live in groups. Which is surprising, because their roar is loud enough to be heard 8 km away.", power: "Any adjacent animals that are not Lions are <b>removed</b>." },
    [AnimalType.POLARBEAR]: { frame: 1, value: 2, strong: true, food: 3, diet: AnimalDiet.CARNI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.WATER, TerrainType.TUNDRA, TerrainType.WILDCARD], sets: ["strong","utilities"], funFact: "The skin of a polar bear is actually black and they can swim for days without needing to rest.", power: "<b>When Scoring</b>: Worth 2 if placed on Water." },
    [AnimalType.WOLF]: { frame: 2, value: 1, food: 1, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.JUNGLE, TerrainType.TUNDRA], sets: ["strong","wildlife"], funFact: "Wolves usually stay with the same partner for life. This reveals where our dogs' loyalty comes from.", power: "<b>Permanent:</b> May <b>not</b> be changed (overlapped, moved or removed) for whatever reason."  },
    [AnimalType.DOLPHIN]: { frame: 3, value: 1, food: 2, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.WATER], sets: ["base", "wildlife"], funFact: "Dolphins let half their brain sleep at a time, can talk in advanced ways, and recognize themselves in a mirror.", power: "<b>When Scoring</b>: 3 Dolphins in a row are worth double the points." },
    [AnimalType.PANDA]: { frame: 4, value: 1, food: 3, diet: AnimalDiet.HERBI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.JUNGLE], sets: ["base", "wildlife"], funFact: "Pandas are one of the few animals who have a thumb. They also eat bamboo practically non-stop and do handstands.", power: "You must also feed Pandas in a claimed Area (even if it's not a closed exhibit)." },
    [AnimalType.GIRAFFE]: { frame: 5, value: 1, food: 1, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.DESERT], sets: ["base","wildlife"], funFact: "A giraffe's patches are like fingerprints and help recognize each other. They also sleep standing up.", power: "<b>When Played</b>: <b>Move</b> one domino that's not overlapped." },
    [AnimalType.ELEPHANT]: { frame: 6, value: 1, strong: true, food: 3, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.DESERT], sets: ["base", "strong"], funFact: "Elephants are the largest living land animal and talk through vibrations. Their trunks contain thousands of muscles.", power: "<b>Rotate</b> one domino that has at least one <b>strong fence</b> on it." },
    [AnimalType.BEAR]: { frame: 7, value: 1, food: 2, diet: AnimalDiet.CARNI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.JUNGLE], sets: ["base", "utilities", TerrainType.WILDCARD], funFact: "Brown bears might look like they are slow or always hibernating. But they can actually run fast, swim, and even climb trees.", power: "You may play another domino with <b>water</b> or a <b>tree</b> for free (if you can)." },
    [AnimalType.CROCODILE]: { frame: 8, value: 1, strong: true, food: 2, diet: AnimalDiet.CARNI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.DESERT, TerrainType.WATER], sets: ["base", "strong"], funFact: "Crocodiles can regenerate their teeth. They're one of the most ancient species that is still alive.", power: "<b>Remove</b> one domino." },
    [AnimalType.OKAPI]: { frame: 9, value: 1, food: 1, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.JUNGLE, TerrainType.TUNDRA, TerrainType.DESERT, TerrainType.WILDCARD], sets: ["base", "utilities"], funFact: "Okapis look like deer, but are family of the Giraffe. They talk in a secret language humans can't hear.", power: "<b>Permanent</b>: Okapi must always be placed adjacent to each other (if possible)." },
    [AnimalType.LEMUR]: { frame: 10, value: 1, food: 1, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.JUNGLE, TerrainType.WILDCARD], sets: ["utilities", "base"], funFact: "Lemurs love sunbathing and doing yoga. When traveling, they hold up their tails like a flag for others to follow.", power: "<b>Permanent</b>: any domino that touches or overlaps a Lemur must match Terrain or Animal (if possible)." },
    [AnimalType.CAMEL]: { frame: 11, value: 1, food: 1, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.DESERT], sets: ["wildlife"], funFact: "Camels are born without their humps. They store water in their blood and their milk is incredibly nutritious.", power: "<b>Permanent:</b> <b>can't</b> be placed adjacent to Water or an animal that prefers Water." },
    [AnimalType.KANGAROO]: { frame: 12, value: 1, strong: true, food: 2, diet: AnimalDiet.HERBI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.DESERT], sets: ["strong"], funFact: "Kangaroos are left-handed and a group is called a Mob. A fitting name, considering they drown their enemies.", power: "All players give 3 tiles to the player on their left or right (your choice)." },
    [AnimalType.REDPANDA]: { frame: 13, value: 1, food: 1, diet: AnimalDiet.CARNI, social: AnimalSocial.SOLITARY, terrains: [TerrainType.GRASS, TerrainType.JUNGLE, TerrainType.WILDCARD], sets: ["utilities", "base"], funFact: "Red pandas were the first panda to be discovered. They mainly eat bamboo and sleep 2/3 of the day.", power: "<b>When Scoring</b>: only scores if their exhibit has an odd size ( = number of squares)." },
    [AnimalType.OTTER]: { frame: 14, value: 2, food: 1, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.WATER, TerrainType.TUNDRA, TerrainType.JUNGLE], sets: ["wildlife"], funFact: "Sea otters have the thickest fur of any animal and are called a keystone species: they are critical to any ecosystem they're in.", power: "<b>Permanent</b>: <b>can't</b> be placed adjacent to an Object or Stall." },
    [AnimalType.DINO]: { frame: 15, value: 1, strong: true, food: 3, diet: AnimalDiet.CARNI, social: AnimalSocial.HERD, terrains: [TerrainType.GRASS, TerrainType.TUNDRA, TerrainType.DESERT, TerrainType.WILDCARD], sets: ["utilities"], extinct: true, funFact: "Dinosaurs were vastly more intelligent and social than many believe. To be expected; they had 100 million years to figure it out!", power: "Execute the power of any other animal currently on the map." }
}

interface GeneralData
{
    frame: number,
    desc?: string,
    value?: number,
    sets?: string[],
    dark?: boolean
}

const STALLS:Record<string, GeneralData> =
{
    toilet: { frame: 0, value: 0.5, desc: "Must be placed next to a path.", sets: ["utilities"] },
    photo_booth: { frame: 1, value: 1, desc: "All <b>adjacent Animals</b> are worth <b>+1</b> (for all players).", sets: ["utilities"] },
    gift_shop: { frame: 2, value: 1, desc: "Any <b>adjacent Area</b> can only contain a single Animal <b>type</b>.", sets: ["utilities"] },
    playground: { frame: 3, value: 2, desc: "All <b>adjacent Exhibits</b> are worth <b>+3</b>.", sets: ["utilities"] },
    information_center: { frame: 4, value: 1.5, desc: "Any <b>adjacent Pawn</b> may be taken back by their owner at any time.", sets: ["utilities"] },
    research_lab: { frame: 5, value: 2, desc: "From now on, <b>Powers</b> activiate and <b>Extinct Animals</b> can be played.", sets: ["utilities"] },
    restaurant: { frame: 6, value: 1.5, desc: "Any <b>adjacent Exhibit</b> does <b>not</b> need to be fed.", sets: ["utilities"] },
}

const OBJECTS:Record<string, GeneralData> =
{
    food: { frame: 0, value: 0.25, sets: ["base", "wildlife", "strong", "utilities"] },
    toys: { frame: 1, value: 1, desc: "Adds <b>+1</b> value to each <b>Animal</b> inside this Exhibit.", sets: ["wildlife"] },
    tree: { frame: 2, value: 0.5, desc: "If this Exhibit contains <b>herbivores</b>, they <b>don't</b> need to be fed.", sets: ["wildlife"] },
    shrubs: { frame: 3, value: 1, desc: "Adds <b>+1</b> size to each <b>Area</b> inside this Exhibit.", sets: ["wildlife"] },
    rocks: { frame: 4, value: 1.5, desc: "You <b>may</b> pretend this tile has a <b>strong fence</b> on <b>all sides</b>.", sets: ["strong"] },
    shelter: { frame: 5, value: 1.5, desc: "The <b>Area</b> it is inside turns <b>into an Exhibit</b> (even if not enclosed).", sets: ["utilities"] },
    camera: { frame: 6, value: 2, desc: "Adds <b>+2</b> value to an Exhibit for each <b>adjacent Animal</b>.", sets: ["utilities"] }, // these would be INSIDE exhibits to track/look up close
}

const TERRAINS:Record<TerrainType, GeneralData> =
{
    [TerrainType.GRASS]: { frame: 0, value: 1, sets: ["base", "strong"] },
    [TerrainType.WATER]: { frame: 1, value: 2, sets: ["base", "wildlife"] },
    [TerrainType.JUNGLE]: { frame: 2, value: 2, sets: ["base", "utilities"], dark: true },
    [TerrainType.TUNDRA]: { frame: 3, value: 2, sets: ["strong"] },
    [TerrainType.DESERT]: { frame: 4, value: 3, sets: ["wildlife"] },
    [TerrainType.WILDCARD]: { frame: 5, value: 2, sets: ["utilities"] }
}

const ITEMS:Record<ItemType,any> =
{
    [ItemType.ANIMAL]: ANIMALS,
    [ItemType.STALL]: STALLS,
    [ItemType.OBJECT]: OBJECTS,
    [ItemType.PATH]: { path: { value: 0.25 } },
    [ItemType.EMPTY]: { empty: { value: 0.25 } }
}

const MISC =
{
    fence_weak: { frame: 0 },
    fence_strong: { frame: 1 },
    path: { frame: 2 },
    entrance: { frame: 3 },
    checkmark: { frame: 4 },
    extinct_stamp: { frame: 5 }
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
    AnimalDiet,
    AnimalSocial,
    AnimalDetailData,
    ItemType
}