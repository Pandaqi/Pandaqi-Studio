
enum TileType
{
    REGULAR = "regular",
    GOAL = "goal",
    SPECIAL = "special",
    POWER = "power",
    HANDICAP = "handicap"
}

interface TileData
{
    frame?: number,
    label?: string,
    desc?: string,
    freq?: number,
    color?: string,
    invertContrast?: boolean,
}

type TileDataDict = Record<string,TileData>;

const EGGS:TileDataDict =
{
    red: { frame: 0, color: "#E61948", invertContrast: true },
    green: { frame: 1, color: "#3CB44B", invertContrast: true },
    yellow: { frame: 2, color: "#FFE119" },
    blue: { frame: 3, color: "#4363D8", invertContrast: true },
    orange: { frame: 3, color: "#F58231", invertContrast: true },
    cyan: { frame: 3, color: "#42D4F4" },
    magenta: { frame: 3, color: "#F032E6", invertContrast: true },
    pink: { frame: 3, color: "#FABED4" },
}

const SPECIAL_EGGS:TileDataDict =
{
    // fixed numbers take up 10 of the special eggs (of max 25)
    negative_small: { frame: 0, desc: "Always scores <b>-1 point</b>.", freq: 3 },
    negative_medium: { frame: 1, desc: "Always scores <b>-3 points</b>.", freq: 2 },
    negative_large: { frame: 2, desc: "Always scores <b>-5 points</b>.", freq: 1 },
    positive_small: { frame: 3, desc: "Always scores <b>1 point</b>.", freq: 2 },
    positive_medium: { frame: 4, desc: "Always scores <b>3 points</b>.", freq: 1 },
    positive_large: { frame: 5, desc: "Always scores <b>5 points</b>.", freq: 1 }

    // @TODO: ~7 actions triggering when added to offer

    // @TODO: ~7 actions triggering when bids checked/revealed
}

// @TODO: add more powers and handicaps
const POWERS:TileDataDict = 
{
    info_offer: { frame: 0, label: "Offer Study", desc: "Look at a facedown tile in the offer." },
    info_bid: { frame: 1, label: "Bid Study", desc: "Look at a player's bid tile." },
    swap_offer: { frame: 2, label: "Swap Offer", desc: "Swap 1 or 2 offer tiles with hand tiles." },
    swap_bid: { frame: 3, label: "Swap Bid", desc: "Swap your bid tile with one from another player." },
    collect_any: { frame: 4, label: "Collect Any", desc: "Collect 1 facedown offer tile; if so, don't bid." },
    flip_any: { frame: 5, label: "Flip Any", desc: "Flip any tile (faceup <-> facedown)." },
}

const HANDICAPS:TileDataDict =
{
    always_follow: { frame: 0, label: "Always Follow", desc: "You must add the same egg to the offer as one already inside." },
    never_follow: { frame: 1, label: "Never Follow", desc: "You must add an egg to the offer that's not already inside." },
    bid_lower: { frame: 2, label: "Bid Lower", desc: "You must always bid lower than the highest offer card." },
    bid_higher: { frame: 3, label: "Bid Higher", desc: "You must always bid higher than the lowest offer card." },
    always_faceup: { frame: 1, label: "Always Faceup", desc: "You must always play at least 1 faceup tile." },
}

interface TileTypeData
{
    textureKey: string,
    backgroundKey: string,
    color?: string,
    backgroundRandom?: number // selects frames 0 to (n-1) of the background spritesheet at random 
}

const TYPE_DATA:Record<TileType, TileTypeData> = 
{
    [TileType.REGULAR]: { textureKey: "eggs", backgroundKey: "eggs_background" },
    [TileType.SPECIAL]: { textureKey: "special", backgroundKey: "misc_background", backgroundRandom: 4, color: "#469990" }, // color = teal
    [TileType.GOAL]: { textureKey: "eggs", backgroundKey: "eggs_background" },
    [TileType.POWER]: { textureKey: "powers", backgroundKey: "misc_background", backgroundRandom: 4, color: "#DCBEFF" }, // color = lavender 
    [TileType.HANDICAP]: { textureKey: "powers", backgroundKey: "misc_background", backgroundRandom: 4, color: "#9A6324" }, // color = brown
}

const MATERIAL = 
{
    [TileType.REGULAR]: EGGS,
    [TileType.SPECIAL]: SPECIAL_EGGS,
    [TileType.GOAL]: EGGS,
    [TileType.POWER]: POWERS,
    [TileType.HANDICAP]: HANDICAPS 
}

export 
{
    EGGS,
    SPECIAL_EGGS,
    POWERS,
    HANDICAPS,
    TileType,
    TYPE_DATA,
    MATERIAL
}
