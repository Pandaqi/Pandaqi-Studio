//
// all possible actions + when they can appear
//
export interface ActionTypeData
{
    frame: number,
    types: ActionType[],
    desc: string,
    bad?: boolean, // false by default; true means the action will generally be something players DON'T want
    prob?: number // default = 1.0 otherwise
    min?: number // default = 1
    max?: number // default = Infinity
}

export interface ActionSpecific
{
    type: ActionType,
    key: string
}

export enum ActionType
{
    HEART = "heart",
    SKULL = "skull",
    STAR = "star",
}

export const ACTIONS:Record<string, ActionTypeData> =
{
    score_any: { frame: 0, types: [ActionType.HEART, ActionType.SKULL], desc: "<b>Score</b> any tile.", min: 3, prob: 1.25 },
    score_adjacent: { frame: 1, types: [ActionType.HEART, ActionType.SKULL], desc: "<b>Score</b> an adjacent tile.", min: 3, prob: 2.0 },
    score_row: { frame: 2, types: [ActionType.HEART, ActionType.SKULL], desc: "<b>Score</b> a tile in the same row.", min: 3, prob: 1.5 },

    score_any_faceup: { frame: 4, types: [ActionType.HEART], desc: "<b>Score</b> any faceup tile.", max: 2 },
    score_neg_faceup: { frame: 5, types: [ActionType.HEART], desc: "<b>Score</b> any faceup negative tile.", bad: true, min: 2 },
    score_type_faceup: { frame: 6, types: [ActionType.HEART], desc: "<b>Score</b> a faceup tile of the same type.", max: 2 },
    score_color_faceup: { frame: 7, types: [ActionType.HEART], desc: "<b>Score</b> a faceup tile of the same color.", max: 2 },
    score_value_faceup: { frame: 8, types: [ActionType.HEART], desc: "<b>Score</b> a faceup tile of lower value than me." },
    double_turn: { frame: 9, types: [ActionType.HEART], desc: "Take <b>another turn</b>.", max: 4 },
    steal: { frame: 10, types: [ActionType.HEART], desc: "<b>Steal</b> 1 scored tile.", max: 4 },

    next_turn_double: { frame: 11, types: [ActionType.HEART, ActionType.SKULL], desc: "The next player gets 2 turns in a row.", bad: true, max: 2, prob: 0.75 },
    lose_scored: { frame: 12, types: [ActionType.HEART], desc: "<b>Lose</b> 2 scored tiles.", bad: true },
    force_score: { frame: 13, types: [ActionType.HEART], desc: "<b>Score</b> all faceup negative tiles.", bad: true, prob: 0.33 },
    score_this: { frame: 14, types: [ActionType.HEART], desc: "<b>Score</b> me.", bad: true, max: 2 },
    others_steal: { frame: 15, types: [ActionType.HEART], desc: "All other players <b>steal</b> 1 random scored tile from you.", bad: true, prob: 0.25, max: 2 },

    study_any: { frame: 16, types: [ActionType.SKULL], desc: "<b>Look at</b> 4 facedown tiles.", prob: 2.0 },
    rearrange_any: { frame: 17, types: [ActionType.SKULL], desc: "<b>Rearrange</b> 4 connected tiles.", max: 3 },
    flip_any: { frame: 18, types: [ActionType.SKULL], desc: "<b>Flip</b> any 2 tiles (ignore actions)." },
    flip_adjacent: { frame: 19, types: [ActionType.SKULL], desc: "<b>Flip</b> all adjacent tiles (ignore actions).", prob: 1.5 },
    flip_row: { frame: 20, types: [ActionType.SKULL], desc: "<b>Flip</b> all tiles in the same row (ignore actions).", prob: 1.25 },
    replace: { frame: 21, types: [ActionType.SKULL], desc: "<b>Replace</b> 1 tile with a scored tile of yours.", max: 3 },

    value_flip_neg: { frame: 22, types: [ActionType.STAR], desc: "<b>Invert</b> the value of 1 negative scored tile.", prob: 2.0 },
    value_flip_pos: { frame: 23, types: [ActionType.STAR], desc: "<b>Invert</b> the value of 1 positive scored tile.", bad: true, prob: 1.35 },
    steal_shield: { frame: 24, types: [ActionType.STAR], desc: "<b>Nobody</b> may <b>steal</b> tiles from you.", max: 2 },
    double_turn_permanent: { frame: 25, types: [ActionType.STAR], desc: "You must do <b>2 flips</b> on your turn.", max: 4 },
    no_clear: { frame: 26, types: [ActionType.STAR], desc: "You <b>can't clear</b> a row by turning them all faceup.", bad: true, max: 1 },
    forced_flip_down: { frame: 27, types: [ActionType.STAR], desc: "You must <b>flip</b> tiles <b>facedown</b> (if possible)", bad: true },
    forced_flip_up: { frame: 28, types: [ActionType.STAR], desc: "You must <b>flip</b> tiles <b>faceup</b> (if possible).", prob: 1.66 },

    special_score_double_self: { frame: 29, types: [ActionType.STAR], desc: "If I'm your most frequent type, <b>triple</b> my score." },
    special_score_double_all: { frame: 30, types: [ActionType.STAR], desc: "If you have my type more than anyone else, <b>triple</b> my score." }, // @NOTE: possibly too long?
    special_score_multiply: { frame: 31, types: [ActionType.STAR], desc: "Worth as many points as <b>how many</b> you have of my type." },
    special_score_all_types: { frame: 32, types: [ActionType.STAR], desc: "Worth 10 points if you have <b>1 tile of each type</b>.", max: 1 },
    special_score_all_colors: { frame: 33, types: [ActionType.STAR], desc: "Worth 10 points if you have <b>1 tile of each color</b>.", max: 1 }

}

//
// the main types ( + their fixed point value)
//
interface TileTypeData
{
    frame: number,
    points: number
    prob?: number
}

export enum TileType
{
    JELLYFISH = "jellyfish",
    CLOWNFISH = "clownfish",
    SEAHORSE = "seahorse", // (Pygmy seahorse?)
    MANTA_RAY = "ray",
    TURTLE = "turtle",
    SHARK = "shark",
    BLUE_WHALE = "whale",
    LEVIATHAN = "leviathan", // negative points -> some kind of Crab/Lobster?
    KRAKEN = "kraken", // negative points -> Electric Eel?
    CTHULHU = "cthulhu", // negative points -> Piranha?
}

/* When I was still going for cryptids:
LOCH_NESS = "nessie",
BIGFOOT = "bigfoot",
YETI = "yeti",
EL_CHUPACABRA = "chupacabra", // negative points
JERSEY_DEVIL = "devil", // negative points
SIREN = "siren",
*/

export const TYPES:Record<TileType, TileTypeData> =
{
    [TileType.LEVIATHAN]: { frame: 0, points: -6 },
    [TileType.CTHULHU]: { frame: 1, points: -4 },
    [TileType.KRAKEN]: { frame: 2, points: -2 },
    [TileType.JELLYFISH]: { frame: 3, points: 1 },
    [TileType.CLOWNFISH]: { frame: 4, points: 2 },
    [TileType.SEAHORSE]: { frame: 5, points: 3 },
    [TileType.MANTA_RAY]: { frame: 6, points: 4 },
    [TileType.TURTLE]: { frame: 7, points: 6 },
    [TileType.SHARK]: { frame: 8, points: 7 },
    [TileType.BLUE_WHALE]: { frame: 9, points: 9 }
}

//
// the background colors used for 3-in-a-rowing in expansions
//
interface ColorTypeData
{
    frame: number,
    color: string
}

export enum ColorType
{
    RED = "red",
    GREEN = "green",
    YELLOW = "yellow",
    BLUE = "blue",
    ORANGE = "orange",
    MAGENTA = "magenta",
}

export const COLORS:Record<ColorType, ColorTypeData> =
{
    [ColorType.RED]: { frame: 0, color: "#E61948" },
    [ColorType.GREEN]: { frame: 1, color: "#3CB44B" },
    [ColorType.YELLOW]: { frame: 2, color: "#FFE119" },
    [ColorType.BLUE]: { frame: 3, color: "#4363D8" },
    [ColorType.ORANGE]: { frame: 4, color: "#F58231" },
    [ColorType.MAGENTA]: { frame: 4, color: "#F032E6" },

}

export const MISC =
{
    // @NOTE: these three icons for actions MUST be named the same as their enum (+ "_icon")
    heart_icon: { frame: 0 },
    skull_icon: { frame: 1 },
    star_icon: { frame: 2 },
    wave_bg: { frame: 3 },
    wave_below: { frame: 4 },
    wave_above: { frame: 5 }
}