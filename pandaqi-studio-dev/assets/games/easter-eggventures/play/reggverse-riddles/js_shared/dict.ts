import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/js_shared/dictShared";
import Bounds from "js/pq_games/tools/numbers/bounds";

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
    empty: { frame: 0 },
    tree: { frame: 1 },
    cave: { frame: 2 },
    dragon: { frame: 3 },
    well: { frame: 4 },
    witch: { frame: 5 },
    statue: { frame: 6 },
    tower: { frame: 7 },
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
    current_num_eggs: { desc: "My tile has at least %numegg% eggs.", descNeg: "My tile has at most %numegg% eggs." },
    current_num_pawns: { desc: "My tile has at least %numpawn% pawns.", descNeg: "My tile has at most %numpawn% pawns." },
    current_side: { desc: "My tile is in the %side% half.", descNeg: "My tile is <b>not</b> in the %side% half." },
    current_egg_diversity: { desc: "My tile has no duplicate eggs", descNeg: "My tile only has eggs of the same type.", prob: 2.5 },
    
    // this is slightly harder, which is why some of them are NOT dynamic (reduces number of them)
    adj_tile: { desc: "I'm next to a %tile% tile.", descNeg: "I'm <b>not</b> next to a %tile% tile." },
    adj_egg: { desc: "I'm next to a %egg% egg.", descNeg: "I'm <b>not</b> next to a %egg% egg." },
    adj_pawn: { desc: "I'm next to a tile with a pawn.", descNeg: "I'm <b>not</b> next to a tile with a pawn." },
    adj_tile_diversity: { desc: "All my neighbor tiles have a different type.", descNeg: "All my neighbor tiles have the same type.", prob: 1.5 },
    adj_egg_diversity: { desc: "All my neighbor tiles have different egg types.", descNeg: "All my neighbor tiles have the same egg types.", prob: 1.25 },

    special_match: { desc: "My tile matches the rules of all other eggs.", prob: 0.2 },

    // this is hard to calculate at a glance, so limit usage
    dir_tile: { desc: "There's a %tile% tile in the same row or column.", prob: 0.75 },
    dir_egg: { desc: "There's a %egg% egg in the same row or column.", prob: 0.75 },
    dir_num_eggs: { desc: "There are at most %numegg% eggs in the same row or column.", descNeg: "There are at least %numegg% eggs in the same row or column.", prob: 0.33 },

}

const ACTION_TILES:TileDataDict =
{
    cleanup: { frame: 0, desc: "Clear all rules for 1 egg type." },
    double_turn: { frame: 1, desc: "Play 2 more tiles this turn." },
    collect_any: { frame: 2, desc: "Collect any single egg token." },
    hand_refresh: { frame: 3, desc: "Discard your entire hand and draw back up from the deck." },
    teleport_self: { frame: 4, desc: "Move to any tile." },
    back_to_pile: { frame: 5, desc: "Move 3 eggs on the board back to their egg pile." },
    switch_rules: { frame: 6, desc: "Make 2 rule rows switch places." },
    steal_token: { frame: 7, desc: "Steal any collected egg token from another player." },

    move_eggs_on_board: { frame: 8, desc: "Move at most 3 eggs from one tile to another." },
    move_eggs_to_board: { frame: 9, desc: "Move 3 tokens of one egg type to any tile(s) on the board." },
    movement_lock: { frame: 10, desc: "Moving is forbidden (for all) until your next turn." },
    rules_lock: { frame: 11, desc: "Changing rule rows is forbidden (for all) until your next turn." },
    actions_lock: { frame: 12, desc: "Playing action tiles is forbidden (for all) until your next turn." },
    trade_eggs: { frame: 13, desc: "Trade 3 collected eggs of the same type for 1 of another type." },
    bigger_hand: { frame: 14, desc: "Draw 3 more tiles into your hand." },
    swap_tiles: { frame: 15, desc: "Make 2 board tiles swap places (including contents)." }
}

// These aren't randomly drawn like rules; _all_ these objectives are built and created.
// However, some types that create a LOT of tiny variations (such as those with two %egg% replacement) are limited to a random maximum of them set in CONFIG. Random ones are discarded to get it down to that reasonable maximum.
const SECRET_OBJECTIVES:TileDataDict =
{
    egg_type_bonus: { desc: "You get +10 points if you collect at least 5 %egg% or %egg% eggs." },
    egg_num_bonus: { desc: "You get +10 points if you have at least 4 eggs of the same type." },
    egg_diversity_bonus: { desc: "You get +10 points if you have an egg of each type in the game." },
    egg_specific_diversity_bonus: { desc: "You get +10 points if you have at least 2 %egg%, %egg% and %egg% eggs. " },
    egg_num_adj_bonus: { desc: "You get +5 points if you have more eggs than your left neighbor." },
    egg_num_adj_rev_bonus: { desc: "You get +7 points if you have fewer eggs than both your neighbors." },
    egg_type_adj_bonus: { desc: "You get +5 points if you have more %egg% eggs than both your neighbors." },
    egg_type_adj_rev_bonus: { desc: "You get +7 points if you fewer %egg% eggs than both your neighbors." },
    egg_kill_bonus: { desc: "You get +7 points if the %egg% egg pile is the first to run out." },
    egg_save_bonus: { desc: "You get +10 points if the %egg% egg pile is the last to run out." },
    obj_guess_bonus: { desc: "You get +10 points if you can accurately guess the secret objectives of both your neighbors." },
    egg_hated: { desc: "Each of your eggs is worth 2 points. Any %egg% or %egg% collected, however, is worth -5 points." },
    egg_minimalism_bonus: { desc: "You get +7 points if there's <b>no</b> egg type that you have more than 2 times." }
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
