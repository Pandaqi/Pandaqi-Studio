import { EGGS_SHARED, EggType, TileDataDict } from "games/easter-eggventures/shared/dictShared";
import Bounds from "js/pq_games/tools/numbers/bounds";
import { CONFIG } from "./config";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import Point from "js/pq_games/tools/geometry/point";

interface SlotRequirement
{
    texture: string,
    frame: number,
    arrow?: number
}

interface TileGridCell
{
    pos?: Point,
    used?: boolean,
    type?: string, // req, slot or dec
    key?: string,
    index?: number
}

interface TileCustomData
{
    slotType?: string, // original key in REQUIREMENTS dict
    slotReq?: SlotRequirement[],
    slotReqRect?: Rectangle,
    scoringRule?: string,
    scoringRuleRect?: Rectangle,
    num?: number,
    playerNum?: number,
    grid?: TileGridCell[][]
}

enum TileType
{
    EGG = "egg",
    PAWN = "pawn", // this includes the Seeker
    MAP = "map",
}

const TILES =
{
    log: { frame: 0, size: "small" },
    rock: { frame: 1, size: "large" },
    wall: { frame: 2, size: "large" },
    tree: { frame: 3, size: "large" },
    grass: { frame: 4, size: "small" },
    hut: { frame: 5, size: "large" },
    flower: { frame: 6, size: "small" },
    gnome: { frame: 7, size: "small" }
}

const SPECIAL_SCORE_RULES:TileDataDict =
{
    // state of tile itself
    tile_eggs: { desc: "The number of eggs on me, minus 2." },
    tile_pawns: { desc: "The number of Pawns on me, minus 2." },
    tile_slots: { desc: "+5 if all slots are now filled, otherwise -5." },
    tile_types: { desc: "The number of unique egg types, minus 2." }, 
    tile_types_spec_1: { desc: 'The number of <img id="eggs" frame="0"> or <img id="eggs" frame="3"> eggs, minus 1.' }, // Red or Darkblue
    tile_types_spec_2: { desc: 'The number of <img id="eggs" frame="1"> or <img id="eggs" frame="2"> eggs, minus 1.' }, // Green or Yellow
    tile_types_spec_3: { desc: 'The number of <img id="eggs" frame="4"> or <img id="eggs" frame="5"> eggs, minus 1.' }, // Lightblue or Orange

    // state of neighbors
    nbs_value: { desc: "The score value of my neighbor" },
    nbs_eggs: { desc: "The number of eggs on my neighbor, minus 2." },
    nbs_pawns: { desc: "The number of pawns on my neighbor, minus 2." },
    nbs_slots: { desc: "+5 if all slots of my neighbor are filled, otherwise -5." },
    nbs_types: { desc: "The number of unique egg types on my neighbor, minus 2." },

    // state of current player
    player_tokens_most: { desc: "+2 if the type played is the type you have the most, otherwise -2." },
    player_tokens_least: { desc: "+2 if the type played is the type you have the least, otherwise -2." },
    player_score_catchup: { desc: "-5 if you are currently the player in the lead, otherwise +5." },

    // state of entire game
    game_eggs: { desc: "The number of eggs on the map divided by 8." },
    game_tiles_forbidden: { desc: "The number of tiles the Seeker can see, divided by 3." },
    game_tiles: { desc: "The number of tiles on the map divided by 5." },

}

interface RequirementData
{
    frame?: number,
    label: string,
    desc: string,
    descNeg: string,
    multiSpriteOptions?: string[], // if set, it can take multiple icons drawn from this list ( = NOT the same as number of _slots_)
    multiSpriteKey?: string, // the texture key to use for drawing the multiple sprites
    multiSpriteDict?: Record<string,any>,
    arrow?: boolean, // whether it needs an arrow around itself
    set?: string,
    prob?: number,
    forbidSingleSlot?: boolean, // if true, this NEEDS multiple egg slots
}

const includedEggs = Object.keys(EGGS_SHARED).slice(0,CONFIG.generation.maxNumEggs);
const REQUIREMENTS:Record<string, RequirementData> =
{
    egg: { label: "Egg", desc: "Play the type of egg shown.", descNeg: "CAN'T play the type of egg shown.", multiSpriteOptions: includedEggs, multiSpriteKey: "eggs", multiSpriteDict: EGGS_SHARED, set: "base", prob: 2.25 },
    hand: { frame: 1, label: "Hand", desc: "Play the type you have the <b>most</b> or <b>least</b>.", descNeg: "CAN'T play the type you have the <b>most</b> or <b>least</b>.", set: "tiles", prob: 0.75 },
    board: { frame: 2, label: "Board", desc: "Play the type that appears the <b>most</b> or <b>least</b> on the board.", descNeg: "CAN'T play the type of egg that appears the <b>most</b> or <b>least</b> on the board.", set: "base", prob: 1.0 },
    skull: { frame: 3, label: "Skull", desc: "Play any egg that hasn't been since your last turn.", descNeg: "CAN'T play any egg that has been played since your last turn.", set: "tiles", prob: 1.25 },
    rainbow: { frame: 4, label: "Rainbow", desc: "Play only <b>different</b> types.", descNeg: "Play only the <b>same</b> type.", set: "base", prob: 1.0, forbidSingleSlot: true },
    rainbow_arrow: { frame: 4, label: "Rainbow Arrow", desc: "Play a type that is <b>different</b> from what's on the neighbor pointed at.", descNeg: "Play a type that is the <b>same</b> as what's on the neighbor pointed at.", arrow: true, set: "base", prob: 2.0 },
    pawn_arrow: { frame: 5, label: "Pawn", desc: "Play any type, but only if the neighbor pointed at has a pawn.", descNeg: "Play any type, but only if the neighbor pointed at has NO pawn.", arrow: true, set: "tiles", prob: 1.25 },
    seeker: { frame: 6, label: "Seeker", desc: "Play a type the Seeker currently <b>sees</b>.", descNeg: "CAN'T play a type the Seeker currently <b>sees</b>.", set: "base", prob: 1.5 }
}

const ACTIONS:TileDataDict =
{
    [EggType.RED]: { desc: "Teleport/Orient the Seeker in any way." },
    [EggType.GREEN]: { desc: "Clear up to 2 tiles of all eggs." },
    [EggType.YELLOW]: { desc: "Swap up to 3 egg tokens with another player." },
    [EggType.BLUE]: { desc: "Hide another egg, but don't take its action." },
    [EggType.ORANGE]: { desc: "Rearrange up to 4 map tiles that hold no eggs." },
    [EggType.CYAN]: { desc: "Take any other action." }
}

const MISC_UNIQUE = 
{
    seeker_pawn: { frame: 0 },
    victory_egg: { frame: 1 },
    starter_tutorial_0: { frame: 2 }, // displayed on starter tile as-is.
    slot_arrows: { frame: 3 }, // the arrows used to point to neighbors around slot requirements that need it
    bg_0: { frame: 4 },
    bg_1: { frame: 5 },
    bg_2: { frame: 6 },
    bg_3: { frame: 7 },

    egg_slot: { frame: 8 },
    divider: { frame: 9 },
    starter_tutorial_1: { frame: 10 },
    starter_tutorial_2: { frame: 11 },
    starter_tutorial_3: { frame: 12 }
}

const MATERIAL:Record<TileType, TileDataDict> = 
{
    [TileType.EGG]: EGGS_SHARED,
    [TileType.MAP]: {},
    [TileType.PAWN]: {},
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
    [TileType.EGG]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Egg Token" },
    [TileType.MAP]: { textureKey: "tiles", backgroundKey: "", label: "Map Tile" },
    [TileType.PAWN]: { textureKey: "", backgroundKey: "", label: "Player Pawn" },
}

export 
{
    TileType,
    MATERIAL,
    TYPE_DATA,
    MISC_UNIQUE,
    ACTIONS,
    RequirementData,
    REQUIREMENTS,
    SPECIAL_SCORE_RULES,
    SlotRequirement,
    TileCustomData,
    TileGridCell,
    TILES
}
