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
    empty: { frame: 0, freq: 8, color: "#A9F983" },
    log: { frame: 1, desc: "If collected, also collect an <b>adjacent</b> egg.", set: "eggstraObstacles", color: "#F9CD83", freq: 2 },
    bunny: { frame: 2, desc: "If collected, also collect another egg that <b>no Pawn</b> points at.", color: "#FFA1D9", freq: 2 },
    rock: { frame: 3, desc: "If collected, it must be the <b>only action</b> on your turn.", color: "#504E57" }, // @NOTE: something like "collecting costs 2 actions" is too weak and meh and similar
    wall: { frame: 4, desc: "You can <b>never search</b> this tile.", color: "#F5A87F" },
    window: { frame: 5, desc: "If searched, you must <b>reveal</b> the egg to <b>all</b> players.", color: "#29CAEE" },
    bag: { frame: 6, desc: "If collected, <b>replace</b> a hidden egg with one from the deck.", set: "eggstraObstacles", color: "#853014", freq: 1 },
    tree: { frame: 7, desc: "Can only search or collect if <b>multiple player's pawns</b> point to me.", color: "#A3FA76", freq: 2 },
    bed: { frame: 8, desc: "Can only search or collect if <b>no other pawn</b> points at me.", set: "eggstraObstacles", color: "#FCFAC7", freq: 2 },
    chicken: { frame: 9, desc: "If searched, <b>swap</b> me with another obstacle tile.", color: "#B1A109" },

    closet: { frame: 10, desc: "If searched, it must be the <b>only</b> action on your turn.", color: "#FFCC97" }, // or bookshelf / pantry
    pillow: { frame: 11, desc: "If collected, you get <b>another turn</b> (3 extra actions).", color: "#2A9CC0", freq: 2 },
    pot_plant: { frame: 12, desc: "If searched, you <b>must</b> also <b>collect</b> an egg this turn.", color: "#DDFF3E" },
    rug: { frame: 13, desc: "If collected, <b>destroy</b> one egg or obstacle (on the map).", set: "eggstraObstacles", color: "#B4000A", freq: 2 },
    shoe: { frame: 14, desc: "If searched, also search another <b>Shoe</b> or <b>Rug</b> tile for free.", set: "eggstraObstacles", color: "#F8B601", freq: 2 },
    curtains: { frame: 15, desc: "If searched or collected, you must <b>reveal</b> all your <b>collected</b> eggs.", color: "#FFACDB", freq: 2 },
    toilet: { frame: 16, desc: "This may <b>never</b> be your <b>current tile</b>.", set: "eggstraObstacles", color: "#32A9E3" },
    stairs: { frame: 17, desc: "If collected, <b>move 2 pawns</b> (of anyone) to any location.", set: "eggstraObstacles", color: "#A4A4A4", freq: 2 }
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
    majority: { frame: 0, type: SEggType.SCORE, desc: "Scores +10 if you <b>collected the most eggs</b>, otherwise -5.", freq: 2 },
    diversity: { frame: 1, type: SEggType.SCORE, desc: "Scores +10 if you collected at least 1 egg <b>of each type</b>." },
    value_changer: { frame: 2, type: SEggType.SCORE, desc: "Pick 2 egg types. They score 2 points; all other types score -2.", freq: 2 },
    undo_egg: { frame: 3, type: SEggType.SCORE, desc: "Makes 1 collected egg of yours worth <b>0 points</b>.", freq: 2 },
    special_special: { frame: 4, type: SEggType.SCORE, desc: "Scores -4 for every <b>Special Egg</b>, but +1 for any other." },
    number_matching: { frame: 5, type: SEggType.SCORE, desc: "Scores -4 for each egg whose <b>number</b> appears only once, +2 for any other.", freq: 2 },

    // rules should also be balanced good/bad for the same reason
    no_sort: { frame: 6, type: SEggType.RULE, desc: "You may collect eggs <b>out of order</b> (numerically)." },
    extra_action: { frame: 7, type: SEggType.RULE, desc: "Scores -5, but you get an <b>extra action</b> each turn." },
    no_peek: { frame: 8, type: SEggType.RULE, desc: "You <b>don't</b> have to reveal the egg to others when Searching." },
    no_specials: { frame: 9, type: SEggType.RULE, desc: "Scores 5, but you <b>can't</b> collect any special eggs." },
    reverse_sort: { frame: 10, type: SEggType.RULE, desc: "From now on, collect eggs in <b>reverse order</b> (numerically).", freq: 2 },
    
    // actions should always be good, because using them is optional
    steal: { frame: 11, type: SEggType.ACTION, desc: "<b>Steal</b> 1 collected egg from another player.", freq: 2 },
    swap: { frame: 12, type: SEggType.ACTION, desc: "<b>Swap</b> 2 tiles (both egg and obstacle)." },
    playing_god: { frame: 13, type: SEggType.ACTION, desc: "Search or Collect <b>any tile</b> (ignore all other rules)." },
    obstacle_dance: { frame: 14, type: SEggType.ACTION, desc: "<b>Rearrange</b> 5 Obstacle tiles." },
    area_search: { frame: 15, type: SEggType.ACTION, desc: "Search <b>all tiles</b> that a pawn of yours can see.", freq: 2 }
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
    [TileType.SPECIAL]: { textureKey: "special_eggs", backgroundKey: "misc", label: "Special Egg", backgroundRandom: new Bounds(0,3), color: "#469990" },
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
