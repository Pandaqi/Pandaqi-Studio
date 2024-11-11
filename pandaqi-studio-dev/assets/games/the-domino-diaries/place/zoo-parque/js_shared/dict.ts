
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
    HERD = "social"
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
    label?: string,
    value?: number,
    sets?: string[],
    dark?: boolean,
}

const STALLS:Record<string, GeneralData> =
{
    toilet: { frame: 0, value: 0.5, label: "Toilet", desc: "Must be placed next to a path.", sets: ["utilities"] },
    photo_booth: { frame: 1, value: 1, label: "Photo Booth", desc: "All <b>adjacent Animals</b> are worth <b>+1</b> (for all players).", sets: ["utilities"] },
    gift_shop: { frame: 2, value: 1, label: "Gift Shop", desc: "Any <b>adjacent Area</b> can only contain a single Animal <b>type</b>.", sets: ["utilities"] },
    playground: { frame: 3, value: 2, label: "Playground", desc: "All <b>adjacent Exhibits</b> are worth <b>+3</b>.", sets: ["utilities"] },
    information_center: { frame: 4, value: 1.5, label: "Info Center", desc: "Any <b>adjacent Pawn</b> may be taken back by their owner at any time.", sets: ["utilities"] },
    research_lab: { frame: 5, value: 2, label: "Research Lab", desc: "From now on, <b>Powers</b> activiate and <b>Extinct Animals</b> can be played.", sets: ["utilities"] },
    restaurant: { frame: 6, value: 1.5, label: "Restaurant", desc: "Any <b>adjacent Exhibit</b> does <b>not</b> need to be fed.", sets: ["utilities"] },
}

const OBJECTS:Record<string, GeneralData> =
{
    food: { frame: 0, value: 0.25, label: "Food", sets: ["base", "wildlife", "strong", "utilities"] },
    toys: { frame: 1, value: 1, label: "Toys", desc: "Adds <b>+1</b> value to each <b>Animal</b> inside this Exhibit.", sets: ["wildlife"] },
    tree: { frame: 2, value: 0.5, label: "Tree", desc: "If this Exhibit contains <b>herbivores</b>, they <b>don't</b> need to be fed.", sets: ["wildlife"] },
    shrubs: { frame: 3, value: 1, label: "Shrubs", desc: "Adds <b>+1</b> size to each <b>Area</b> inside this Exhibit.", sets: ["wildlife"] },
    rocks: { frame: 4, value: 1.5, label: "Rocks", desc: "You <b>may</b> pretend this tile has a <b>strong fence</b> on <b>all sides</b>.", sets: ["strong"] },
    shelter: { frame: 5, value: 1.5, label: "shelter", desc: "The <b>Area</b> it is inside turns <b>into an Exhibit</b> (even if not enclosed).", sets: ["utilities"] },
    camera: { frame: 6, value: 2, label: "Camera", desc: "Adds <b>+2</b> value to an Exhibit for each <b>adjacent Animal</b>.", sets: ["utilities"] }, // these would be INSIDE exhibits to track/look up close
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

enum RuleVibe
{
    GOOD = "good",
    BAD = "bad"
}

// @NOTE: Remember a large majority of these cards have no rule at all. The percentage of that is controlled separately by config
const CAMPAIGN_RULES =
{
    // BAD
    terrain_bad: { desc: "Terrain %terrain% can never be overlapped by an animal.", vibe: RuleVibe.BAD },
    animal_bad: { desc: "Animal %animal% doesn't count when calculating score.", vibe: RuleVibe.BAD },
    no_move: { desc: "If you have no valid move, permanently discard a domino.", vibe: RuleVibe.BAD },
    no_duplicates: { desc: "You can't play two dominoes with the same %property% on the same turn.", vibe: RuleVibe.BAD },
    no_duplicates_layer: { desc: "You can't play two dominoes of the same layer (TOP/BOTTOM) on the same turn.", vibe: RuleVibe.BAD },
    extra_campaign: { desc: "If you create an Exhibit with fewer than 3 spaces, draw an extra Campaign Card.", vibe: RuleVibe.BAD },
    score_formula_bad: { desc: "When calculating Exhibit score, don't multiply the parts, but simply add them.", vibe: RuleVibe.BAD },

    // GOOD
    move_pawn: { desc: "Once this game, you may move a used Pawn of yours.", vibe: RuleVibe.GOOD },
    animal_good: { desc: "Animal %animal% counts double when calculating score.", vibe: RuleVibe.GOOD },
    dominoes_more: { desc: "You may play 3 dominoes (at most) on your turn.", vibe: RuleVibe.GOOD },
    points_reward: { desc: "Whenever a player reaches %pointthreshold% points for the first time, they may remove a random Campaign Card.", vibe: RuleVibe.GOOD },
    score_formula_good: { desc: "The score of an Exhibit uses all tiles inside, not just those of one terrain type.", vibe: RuleVibe.GOOD },
}

enum CampType
{
    WIN = "win",
    REPLACE = "replace",
    ENDGAME = "endgame"
}

enum CampDiff
{
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}

const CAMPAIGN_MISSIONS =
{
    exhibit_score: { desc: "There's an Exhibit that scores (at least) %num% points.", numScale: [6, 10, 15], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    player_points: { desc: "Every player has at least %num% points.", numScale: [5, 10, 15], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    player_points_diversity: { desc: "All player scores are within %num% points of one another.", numScale: [8, 5, 3], types: [CampType.ENDGAME] },
    exhibit_spaces: { desc: "There's no Exhibit with fewer than %num% spaces.", numScale: [3, 4, 6], types: [CampType.ENDGAME] },
    areas_no_Exhibit: { desc: "Your zoo has at most %num% Areas not within an Exhibit.", numScale: [7, 5, 3], types: [CampType.ENDGAME] },
    exhibit_animal_diversity: { desc: "There's an Exhibit with %num% different animal types.", numScale: [4, 5, 6], types: [CampType.WIN, CampType.ENDGAME] },
    player_weakest_points: { desc: "Your weakest player has (at least) %num% points.", numScale: [6, 10, 14], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    player_strongest_points: { desc: "Your strongest player has (at least) %num% points.", numScale: [8, 12, 18], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    main_path: { desc: "Your zoo has a connected path of %num%(+) spaces.", numScale: [6, 10, 14], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    exhibit_foodless: { desc: "There are (at least) %num% Exhibits without food inside.", numScale: [2,3,4], types: [CampType.ENDGAME, CampType.REPLACE] },
    exhibit_food_specific: { desc: "There's an Exhibit with %num%(+) food inside.", numScale: [2,4,6], types: [CampType.WIN, CampType.ENDGAME] },
    exhibit_dynamic_num: { desc: "Your zoo has (at least) %num% x #players Exhibits.", numScale: [1,2,2.5], types: [CampType.WIN, CampType.ENDGAME] },
    animal_count: { desc: "Every animal type has been played at least %num% times.", numScale: [1,2,3], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    terrain_specific: { desc: "There's an Area of terrain %terrain% of at least %num% spaces.", numScale: [3,5,8], types: [CampType.WIN, CampType.ENDGAME] },
    Exhibits_path: { desc: "There are (at most) %num% Exhibits with a path inside.", numScale: [2, 1, 0], types: [CampType.ENDGAME, CampType.REPLACE] },
    fence_uniformity: { desc: "There are %num% Exhibits where all fences are the same.", numScale: [2,3,4], types: [CampType.WIN, CampType.ENDGAME] },
    exhibit_size: { desc: "There's an Exhibit with %num%(+) squares", numScale: [5, 7, 10], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    exhibit_areas: { desc: "There's an Exhibit with %num%(+) Areas", numScale: [2, 3, 4], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    property_claim: { desc: "A player has claimed %num%(+) Areas with the same %property%.", numScale: [2,3,4], types: [CampType.ENDGAME, CampType.REPLACE] },

    exhibit_empty: { desc: "There's an Exhibit without empty space inside.", diff: CampDiff.EASY, types: [CampType.ENDGAME, CampType.REPLACE] },
    exhibit_path: { desc: "There's an Exhibit without a path inside.", diff: CampDiff.EASY, types: [CampType.ENDGAME] },
    single_player_all_pawns: { desc: "A player has placed all their pawns.", diff: CampDiff.EASY, types: [CampType.ENDGAME, CampType.REPLACE] },
    multi_area_claim: { desc: "A player has claimed multiple Areas within the same Exhibit", diff: CampDiff.EASY, types: [CampType.ENDGAME, CampType.REPLACE] },

    exhibit_empty_and_path: { desc: "There's an Exhibit without empty space or paths inside.", diff: CampDiff.MEDIUM, types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    exhibit_all_types: { desc: "There's an Exhibit with all possible animal types inside.", diff: CampDiff.MEDIUM, types: [CampType.WIN, CampType.ENDGAME] },
    all_players_all_pawns: { desc: "All players have placed all their pawns.", diff: CampDiff.MEDIUM, types: [CampType.ENDGAME] },
    exhibit_claim_all: { desc: "An Exhibit is claimed by all players.", diff: CampDiff.MEDIUM, types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE] },
    exhibit_animal_match: { desc: "An Exhibit contains only animals of the same type.", diff: CampDiff.MEDIUM, types: [CampType.ENDGAME, CampType.REPLACE] },

    exhibit_pure: { desc: "There's an Exhibit where every space has terrain and an animal.", diff: CampDiff.HARD, types: [CampType.WIN, CampType.ENDGAME] },
    all_animals_caged: { desc: "All animals in the zoo must be inside an Exhibit.", diff: CampDiff.HARD, types: [CampType.ENDGAME] },
    path_circle: { desc: "There's an Exhibit where all adjacent spaces are a path.", diff: CampDiff.HARD, types: [CampType.WIN, CampType.ENDGAME] },
    all_preferred_terrains: { desc: "All animal types must be on top of each preferred terrain (at least once).", diff: CampDiff.HARD, types: [CampType.WIN, CampType.ENDGAME] },
    animal_area_match: { desc: "An Area of 3(+) tiles contains only animals of the same type.", diff: CampDiff.HARD, types: [CampType.ENDGAME, CampType.REPLACE] },

    // EXPANSIONS-ONLY
    strong_only: { desc: "There's an Exhibit with only %strong% animals inside.", diff: CampDiff.EASY, types: [CampType.ENDGAME, CampType.REPLACE], sets: ["strong"] },

    herbivores_count: { desc: "There's an %areatype% with at least %num% %diet%.", numScale: [2,3,5], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE], sets: ["wildlife"] },
    herd_count: { desc: "There's an %areatype% with at least %num% %herd% animals.", numScale: [2,3,5], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE], sets: ["wildlife"] },
    herd_area_claim: { desc: "There's a (Social) Area claimed by all players.", diff: CampDiff.EASY, types: [CampType.ENDGAME, CampType.REPLACE], sets: ["wildlife"] },
    exhibit_objects: { desc: "There's an Exhibit with %num%(+) Objects inside.", numScale: [1,2,4], types: [CampType.WIN, CampType.ENDGAME, CampType.REPLACE], sets: ["wildlife"] },
    exhibit_objects_no: { desc: "There's an Exhibit with no objects inside", diff: CampDiff.EASY, types: [CampType.ENDGAME, CampType.REPLACE], sets: ["wildlife"] },
    exhibit_objects_no_adjacent: { desc: "There's an Exhibit with no objects adjacent to it", diff: CampDiff.MEDIUM, types: [CampType.ENDGAME], sets: ["wildlife"] },

    exhibit_zero_food: { desc: "There's an Exhibit (with animals) which requires 0 food.", diff: CampDiff.EASY, types: [CampType.ENDGAME, CampType.REPLACE], sets: ["utilities"] },
    exhibit_lotsa_food: { desc: "There's an Exhibit (with animals) which requires 2(+) food.", diff: CampDiff.MEDIUM, types: [CampType.ENDGAME, CampType.REPLACE], sets: ["utilities"] },
    exhibit_stalls: { desc: "There's an Exhibit with %num%(+) Stalls inside.", numScale: [1,2,4], types: [CampType.WIN, CampType.ENDGAME], sets: ["utilities"] },
    exhibit_stalls_adjacent: { desc: "There's an Exhibit with no Stalls adjacent to it.", diff: CampDiff.EASY, types: [CampType.ENDGAME], sets: ["utilities"] },
}

const DYNAMIC_STRINGS =
{
    "%property%": ["terrain", "animal", "fence"],
    "%pointthreshold%": [6,7,8,9,10],    
    "%strong%": ["strong", "weak"],
    "%areatype%": ["Exhibit", "Area"],
    "%diet%": ["herbivores", "carnivores"],
    "%herd%": ["social", "solitary"]
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
    ItemType,

    CAMPAIGN_RULES,
    DYNAMIC_STRINGS,
    CAMPAIGN_MISSIONS,
    RuleVibe,
    CampType,
    CampDiff
}