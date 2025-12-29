import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/shared/dictShared";
import { Bounds } from "lib/pq-games";

enum TileType
{
    EGG = "egg",
    MAP = "map",
    RULE = "rule",
    PAWN = "pawn",
    ACTION = "action",
    OBJECTIVE = "objective"
}

const MAP_TILES:TileDataDict =
{
    empty: { frame: 0, color: "#C7FFCA" },
    tree: { frame: 1, color: "#E2FF64" },
    cave: { frame: 2, color: "#7D304F" },
    dragon: { frame: 3, color: "#BBECFF" },
    well: { frame: 4, color: "#8DDF31" },
    witch: { frame: 5, color: "#8A3DBC" },
    statue: { frame: 6, color: "#F4F682" },
    tower: { frame: 7, color: "#FFBBB8" },
}

/*
These are dynamically replaced with all possible options upon generation.
* %tile% = map tiles
* %egg% = egg type
* %numegg% = possible numbers of eggs
* %numpawn% = possible numbers for pawns
* %side% = left/right/top/bottom
*/
const RULES:TileDataDict =
{
    current_tile: { desc: "My tile is %tile%.", descNeg: "My tile is <b>not</b> %tile%." },
    current_egg: { desc: "My tile has a %egg% egg.", descNeg: "My tile does <b>not</b> have a %egg% egg." },
    current_num_eggs: { desc: "My tile has at least %numegg% <b>eggs</b>.", descNeg: "My tile has at most %numegg% <b>eggs</b>." },
    current_side: { desc: "My tile is in the <b>%side% half</b>.", descNeg: "My tile is <b>not</b> in the <b>%side% half</b>." },
    current_egg_diversity: { desc: "My tile has <b>no duplicate</b> eggs", descNeg: "My tile only has eggs of the <b>same type</b>.", prob: 2.5 },
    
    // this is slightly harder, which is why some of them are NOT dynamic (reduces number of them)
    adj_tile: { desc: "I'm next to a %tile% tile.", descNeg: "I'm <b>not</b> next to a %tile% tile." },
    adj_egg: { desc: "I'm next to a %egg% egg.", descNeg: "I'm <b>not</b> next to a %egg% egg." },
    adj_pawn: { desc: "I'm next to a tile with a <b>pawn</b>.", descNeg: "I'm <b>not</b> next to a tile with a <b>pawn</b>." },
    adj_tile_diversity: { desc: "All my neighbor tiles have a <b>different type</b>.", descNeg: "All my neighbor tiles have the <b>same type</b>.", prob: 1.5 },
    adj_egg_diversity: { desc: "All my neighbor tiles have <b>different egg types</b>.", descNeg: "All my neighbor tiles have the <b>same egg types</b>.", prob: 1.25 },

    special_match: { desc: "My tile matches the rules of <b>all other eggs</b>.", prob: 0.2 },

    // this is hard to calculate at a glance, so limit usage
    dir_tile: { desc: "There's a %tile% tile in the <b>same %row%</b>.", descNeg: "There's <b>no</b> %tile% in the <b>same %row%</b>.", prob: 0.33 },
    dir_egg: { desc: "There's a %egg% egg in the <b>same %row%</b>.", descNeg: "There's <b>no</b> %egg% in the <b>same %row%</b>", prob: 0.33 },
    dir_num_eggs: { desc: "There are at most %numegg% eggs in the <b>same %row%</b>.", descNeg: "There are at least %numegg% eggs in <b>the same %row%</b>.", prob: 1.0 },
    dir_num_pawns: { desc: "There are at least %numpawn% <b>pawns</b> in the <b>same %row%</b>.", descNeg: "There are at most %numpawn% <b>pawns</b> in the <b>same %row%</b>.", prob: 1.0 },

}

const ACTION_TILES:TileDataDict =
{
    cleanup: { frame: 0, desc: "<b>Clear</b> all rules for 1 egg type.", freq: 2 },
    double_turn: { frame: 1, desc: "<b>Play</b> 2 more tiles this turn." },
    collect_any: { frame: 2, desc: "<b>Collect</b> any single egg token." },
    hand_refresh: { frame: 3, desc: "<b>Discard</b> your entire hand and draw back up from the deck." },
    teleport_self: { frame: 4, desc: "<b>Move</b> to any tile.", freq: 2 },
    back_to_pile: { frame: 5, desc: "<b>Move 3 eggs</b> on the board back to their egg pile.", freq: 2 },
    switch_rules: { frame: 6, desc: "Make 2 rule rows <b>switch places</b>." },
    steal_token: { frame: 7, desc: "<b>Steal</b> any collected egg token from another player." },

    move_eggs_on_board: { frame: 8, desc: "<b>Move at most 3 eggs</b> from one tile to another." },
    move_eggs_to_board: { frame: 9, desc: "<b>Move 3 eggs</b> from a pile to any tile(s) on the board." },
    movement_lock: { frame: 10, desc: "<b>Moving is forbidden</b> (for all) until your next turn." },
    rules_lock: { frame: 11, desc: "<b>Changing</b> rule rows is <b>forbidden</b> (for all) until your next turn." },
    actions_lock: { frame: 12, desc: "<b>Playing</b> action tiles is <b>forbidden</b> (for all) until your next turn." },
    trade_eggs: { frame: 13, desc: "<b>Trade 3</b> collected eggs of the same type for <b>1 of another type</b>." },
    bigger_hand: { frame: 14, desc: "<b>Draw 3 more tiles</b> into your hand." },
    swap_tiles: { frame: 15, desc: "Make 2 board tiles <b>swap places</b> (including contents).", freq: 2 }
}

// These aren't randomly drawn like rules; _all_ these objectives are built and created.
// However, some types that create a LOT of tiny variations (such as those with two %egg% replacement) are limited to a random maximum of them set in CONFIG. Random ones are discarded to get it down to that reasonable maximum.
const SECRET_OBJECTIVES:TileDataDict =
{
    egg_type_bonus: { desc: "You get <b>+10 points</b> if you collect at least 5 %egg% or %egg% eggs." },
    egg_num_bonus: { desc: "You get <b>+10 points</b> if you have at least 4 eggs of the same type." },
    egg_diversity_bonus: { desc: "You get <b>+10 points</b> if you have an egg of each type in the game." },
    egg_specific_diversity_bonus: { desc: "You get <b>+10 points</b> if you have at least 2 %egg%, %egg% and %egg% eggs. " },
    egg_num_adj_bonus: { desc: "You get <b>+5 points</b> if you have more eggs than your left neighbor." },
    egg_num_adj_rev_bonus: { desc: "You get <b>+7 points</b> if you have fewer eggs than both your neighbors." },
    egg_type_adj_bonus: { desc: "You get <b>+5 points</b> if you have more %egg% eggs than both your neighbors." },
    egg_type_adj_rev_bonus: { desc: "You get <b>+7 points</b> if you have fewer %egg% eggs than both your neighbors." },
    egg_kill_bonus: { desc: "You get <b>+7 points</b> if the %egg% egg pile is the first to run out." },
    egg_save_bonus: { desc: "You get <b>+10 points</b> if the %egg% egg pile is the last to run out." },
    obj_guess_bonus: { desc: "You get <b>+10 points</b> if you can accurately guess the secret objectives of both your neighbors." },
    egg_hated: { desc: "Each of your eggs is worth <b>2 points</b>. Any %egg% or %egg% collected, however, is worth <b>-5 points</b>." },
    egg_minimalism_bonus: { desc: "You get <b>+7 points</b> if there's <b>no</b> egg type that you have more than twice." }
}

// (The shared one is called MISC_SHARED)
// This only exists to display the movement instructions and action tiles, but it was cleaner to put it into its own spritesheet anyway
const MISC_UNIQUE:TileDataDict =
{
    bg: { frame: 0 },
    pawn: { frame: 1 },
    checkmark: { frame: 2 },
    cross: { frame: 3 },
    bg_objective: { frame: 4 },
    icon_objective: { frame: 5 }
}

const MATERIAL:Record<TileType, TileDataDict> = 
{
    [TileType.EGG]: EGGS_SHARED,
    [TileType.MAP]: MAP_TILES,
    [TileType.RULE]: RULES,
    [TileType.PAWN]: {},
    [TileType.ACTION]: ACTION_TILES,
    [TileType.OBJECTIVE]: SECRET_OBJECTIVES,
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
    [TileType.MAP]: { textureKey: "map_tiles", backgroundKey: "misc", label: "Map Tile", backgroundRandom: new Bounds(0,3) },
    [TileType.RULE]: { textureKey: "", backgroundKey: "", label: "Rule/Move Tile", backgroundRandom: new Bounds(0,3) },
    [TileType.PAWN]: { textureKey: "pawns", backgroundKey: "", label: "Player Pawn" },
    [TileType.ACTION]: { textureKey: "action_tiles", backgroundKey: "", label: "Action Tile" },
    [TileType.OBJECTIVE]: { textureKey: "", backgroundKey: "", label: "Secret Objective" }, 
}

export 
{
    MAP_TILES,
    RULES,
    ACTION_TILES,
    SECRET_OBJECTIVES,
    MISC_UNIQUE,
    TileType,
    MATERIAL,
    TYPE_DATA
}
