import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/js_shared/dictShared";
import Bounds from "js/pq_games/tools/numbers/bounds";

enum TileType
{
    EGG = "egg",
    SPECIAL = "special",
    PAWN = "pawn",
    OBSTACLE = "obstacle",
}

const OBSTACLES:TileDataDict =
{
    empty: { frame: 0, freq: 7 },
    log: { frame: 1, desc: "If collected, also collect an adjacent egg.", set: "eggstraObstacles" },
    bunny: { frame: 2, desc: "If collected, also collect another egg that no Pawn points at." },
    rock: { frame: 3, desc: "If collected, that must be the only action on your turn." }, // @NOTE: something like "collecting costs 2 actions" is too weak and meh and similar
    wall: { frame: 4, desc: "You can never search this tile." },
    window: { frame: 5, desc: "If searched, you must reveal the egg to all players." },
    bag: { frame: 6, desc: "If collected, replace a hidden egg with one from the deck.", set: "eggstraObstacles" },
    tree: { frame: 7, desc: "Can only search or collect if multiple player's pawns point to me." },
    bed: { frame: 8, desc: "Can only search or collect if no other pawn points at me.", set: "eggstraObstacles" },
    chicken: { frame: 9, desc: "If searched, swap me with another obstacle tile." },
    closet: { frame: 10, desc: "If searched, that must be the only action on your turn." }, // or bookshelf / pantry
    pillow: { frame: 11, desc: "If collected, you get another turn (3 extra actions)." },
    pot_plant: { frame: 12, desc: "If searched, you must also collect an egg this turn." },
    rug: { frame: 13, desc: "If collected, destroy one egg or obstacle (on the map).", set: "eggstraObstacles" },
    shoe: { frame: 14, desc: "If searched, also search another Shoe or Rug tile for free.", set: "eggstraObstacles" },
    curtains: { frame: 15, desc: "If searched or collected, you must reveal all your collected eggs." },
    toilet: { frame: 16, desc: "This may never be your current tile.", set: "eggstraObstacles" },
    stairs: { frame: 17, desc: "If collected, move 2 pawns (of any player) to any location.", set: "eggstraObstacles" }
}

enum SEggType
{
    SCORE = "score",
    RULE = "rule",
    ACTION = "action"
}

const SPECIAL_EGGS:TileDataDict =
{
    // scoring rules should be balanced between good/bad, so you actually have to think about it or work for it
    majority: { frame: 0, type: SEggType.SCORE, desc: "Worth +10 points if you <b>collected the most eggs</b>, otherwise -5." },
    diversity: { frame: 2, type: SEggType.SCORE, desc: "Worth +10 points if you collected at least 1 egg <b>of each type</b>." },
    value_changer: { frame: 3, type: SEggType.SCORE, desc: "Worth +2 points for each Red / Blue egg collected, worth -2 points for each Green / Orange egg." },
    undo_egg: { frame: 4, type: SEggType.SCORE, desc: "Makes 1 collected egg worth <b>0 points</b>." },
    special_special: { frame: 5, type: SEggType.SCORE, desc: "Worth -4 points for every <b>Special Egg</b>, but +1 for any other egg." },
    number_matching: { frame: 6, type: SEggType.SCORE, desc: "Worth +3 points for each <b>pair</b> of eggs with the <b>same number</b>, but -3 for each lonely egg." },

    // rules should also be balanced good/bad for the same reason
    no_sort: { frame: 7, type: SEggType.RULE, desc: "You're allowed to collect eggs <b>out of order</b> (numerically)." },
    extra_action: { frame: 8, type: SEggType.RULE, desc: "Worth -5 points, but you get an <b>extra action</b> each turn." },
    no_peek: { frame: 9, type: SEggType.RULE, desc: "You <b>don't</b> have to reveal the egg to others when Searching." },
    no_specials: { frame: 10, type: SEggType.RULE, desc: "Worth 5 points, but you <b>can't</b> collect any special eggs." },
    reverse_sort: { frame: 11, type: SEggType.RULE, desc: "From now on, you must collect eggs in <b>reverse order</b> (numerically)." },
    
    // actions should always be good, because using them is optional
    steal: { frame: 12, type: SEggType.ACTION, desc: "<b>Steal</b> 1 collected egg from another player." },
    swap: { frame: 13, type: SEggType.ACTION, desc: "<b>Swap</b> 2 tiles (both egg and obstacle)." },
    playing_god: { frame: 14, type: SEggType.ACTION, desc: "Search or Collect <b>any tile</b>, ignoring all other rules." },
    obstacle_dance: { frame: 15, type: SEggType.ACTION, desc: "<b>Rearrange</b> 5 Obstacle tiles." },
    area_search: { frame: 16, type: SEggType.ACTION, desc: "Search <b>all tiles</b> one of your pawns looks at." }
}

const MATERIAL:Record<TileType, TileDataDict> = 
{
    [TileType.EGG]: EGGS_SHARED,
    [TileType.SPECIAL]: SPECIAL_EGGS,
    [TileType.OBSTACLE]: OBSTACLES,
    [TileType.PAWN]: {}
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
    [TileType.EGG]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Points Egg" },
    [TileType.SPECIAL]: { textureKey: "special_eggs", backgroundKey: "misc", label: "Special Egg", backgroundRandom: new Bounds(0,3) },
    [TileType.OBSTACLE]: { textureKey: "obstacles", backgroundKey: "misc", label: "Obstacle", backgroundRandom: new Bounds(0,3) },
    [TileType.PAWN]: { textureKey: "", backgroundKey: "", label: "Player Pawn" }
}

export 
{
    SPECIAL_EGGS,
    OBSTACLES,
    TileType,
    MATERIAL,
    TYPE_DATA
}
