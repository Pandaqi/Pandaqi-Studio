
enum TileType
{
    REGULAR = "regular",
    GATED = "gated",
    PAWN = "pawn"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    freq?: number,
    prob?: number,
    default?: boolean
}

interface WaterFlow
{
    topLeft: boolean,
    topRight: boolean,
    bottomLeft: boolean,
    bottomRight: boolean
}

const ACTIONS:Record<string, GeneralData> =
{
    // core/default actions that can also be icons
    score: { desc: "<b>Score</b> a tile.", default: true, prob: 4.0 },
    draw: { desc: "<b>Draw</b> a tile.", default: true, prob: 4.0 },
    add: { desc: "<b>Add</b> a tile to the waterfall.", default: true, prob: 4.0 },

    // the rest
    jump: { desc: "<b>Jump</b> over the next tile." },
    teleport: { desc: "<b>Teleport</b> to a tile in the same row ( = not up nor down)." },
    stop_forced: { desc: "<b>Stop</b> here." },
    stop_choice: { desc: "You <i>may</i> <b>stop</b> here." },
    stop_choice_score: { desc: "You may <b>stop</b> here. If so, score your worst tile." },
    swap_hand: { desc: "<b>Swap</b> your entire hand with another player." },
    change_map: { desc: "<b>Swap</b> two tiles in the Waterfall." },
    
    score_tile: { desc: "<b>Score</b> <i>this</i> tile." },
    score_invert: { desc: "<b>Score</b> a tile that has <i>no</i> matching gemstones (with this tile)." },
    remove_tile: { desc: "<b>Remove</b> a tile from the Waterfall." },
    move_pawns: { desc: "<b>Move</b> a (stuck) Pawn to another tile." },
}

const ACTIONS_CONDITIONAL:Record<string, GeneralData> =
{
    score_twice: { desc: "<b>score</b> twice." },
    add_three: { desc: "<b>add</b> (up to) 3 tiles to the Waterfall." },
    draw_three: { desc: "<b>draw</b> 3 tiles." },
    remove_pawn: { desc: "<b>remove</b> a stuck Pawn." },
    jump_ability: { desc: "<b>you may jump over</b> tiles with a Pawn." },
}

const CONDITIONS:Record<string, GeneralData> =
{
    pawn_stuck_adjacent: { desc: "If a <i>pawn</i> is stuck on an <i>adjacent tile</i>" },
    path_all_gemstones: { desc: "If your path has <i>all unique gemstones</i>" },
    path_diversity_gemstones: { desc: "If your path has <b>3 unique gemstones</b>" },
    hand_size_large: { desc: "If you have <i>3+ tiles</i>" },
    hand_size_small: { desc: "If you have <i>3- tiles</i>" },
    path_specific_1: { desc: "If your path has <b>only red, green and blue</b> gemstones" },
    path_specific_2: { desc: "If your path has <b>only purple, yellow, and multicolor</b> gemstones" },
}

const GATES:Record<string, GeneralData> =
{
    num_stuck_low: { desc: "<b>No Pawn is stuck</b> in the Waterfall." },
    num_stuck_high: { desc: "At least <b>1 Pawn is stuck</b> in the Waterfall." },
    no_score: { desc: "You've taken no <b>score</b> action yet." },
    no_add: { desc: "You've taken no <b>add</b> action yet." },
    no_draw: { desc: "You've taken no <b>draw</b> action yet." },

    path_similarity: { desc: "Your path goes in only <b>one direction</b> (left <i>or</i> right)." },
    path_content_most: { desc: "Your path has at most <b>2 unique gemstones</b>." },
    path_content_least: { desc: "Your path has at least <b>3 unique gemstones</b>." },
    path_content_specific_red: { desc: "Your path has <b>red</b> gemstones." },
    path_content_specific_green: { desc: "Your path has <b>green</b> gemstones." },
    path_content_specific_blue: { desc: "Your path has <b>blue</b> gemstones." },
    path_content_specific_pink: { desc: "Your path has <b>pink</b> gemstones." },
    path_content_specific_yellow: { desc: "Your path has <b>yellow</b> gemstones." },
    path_length: { desc: "Your path is at most 4 steps." },

    multi_space: { desc: "This tile or an adjacent one already has a Pawn." }
}

const GEMSTONES:Record<string, GeneralData> =
{
    red: { frame: 0 },
    green: { frame: 1 },
    blue: { frame: 2 },
    pink: { frame: 3 },
    multi: { frame: 4 },
    yellow: { frame: 5 }
}

const DECORATION:Record<string, GeneralData> = 
{
    template_regular: { frame: 0 },
    template_gated: { frame: 1 },
    bg_0: { frame: 2 },
    bg_1: { frame: 3 },
    bg_2: { frame: 4 },
    bg_3: { frame: 5 },
    boulders_horizontal: { frame: 6 },
    boulders_vertical: { frame: 7 },

    decoration_0: { frame: 8 },
    decoration_1: { frame: 9 },
    decoration_2: { frame: 10 },
    decoration_3: { frame: 11 }
}

const MISC =
{
    water_straight: { frame: 0 },
    water_diagonal: { frame: 1 },
    gemstone_shadow_circle: { frame: 2 },
    pawns_0: { frame: 3 },
    pawns_1: { frame: 4 },
    pawns_2: { frame: 5 },
    default_action_score: { frame: 6 },
    default_action_draw: { frame: 7 },
    default_action_add: { frame: 8 }
}


export {
    TileType,
    DECORATION,
    MISC,
    ACTIONS,
    GATES,
    GEMSTONES,
    CONDITIONS,
    ACTIONS_CONDITIONAL,
    WaterFlow
};

