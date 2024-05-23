
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
    min?: number,
    max?: number
}

interface WaterFlow
{
    topLeft: boolean,
    topRight: boolean,
    bottomLeft: boolean,
    bottomRight: boolean
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

const ACTIONS:Record<string, GeneralData> = 
{
    add: { frame: 0, desc: "<b>Add</b> a tile to the waterfall.", prob: 1.5, min: 5 },
    draw: { frame: 1, desc: "<b>Draw</b> 3 tiles (into your hand).", prob: 2.0, min: 8 },
    score: { frame: 2, desc: "<b>Score</b> 2 tiles. (With a matching gemstone on the path taken so far.)", prob: 1.75, min: 8 },
    remove: { frame: 3, desc: "<b>Remove</b> a tile from the waterfall. (Waterfall must stay connected!)", prob: 0.45 },
    swap: { frame: 4, desc: "<b>Swap</b> two tiles in the waterfall." },
    leapfrog: { frame: 5, desc: "This turn, once, you may <b>jump</b> over a tile OR <b>share</b> a tile with a pawn." },
    pawn: { frame: 6, desc: "<b>Move</b> a pawn to another tile." },
    wildcard: { frame: 7, desc: "Take <b>any other action</b> that's in the path you've taken." }
}

const MISC =
{
    bg_0: { frame: 0 },
    bg_1: { frame: 1 },
    bg_2: { frame: 2 },
    bg_3: { frame: 3 },
    pawns_0: { frame: 4 },
    pawns_1: { frame: 5 },
    pawns_2: { frame: 6 },
    card_template: { frame: 7 }
}

const PAWNS =
{
    0: { color: "#FF837F", label: "Red" },
    1: { color: "#FF6EC3", label: "Pink" },
    2: { color: "#A9D7F0", label: "Blue" },
    3: { color: "#DB8BFE", label: "Purple" },
    4: { color: "#9DFE75", label: "Green" },
    5: { color: "#FFA76A", label: "Orange" },
}

export {
    TileType,
    ACTIONS,
    MISC,
    GEMSTONES,
    WaterFlow,
    PAWNS
};

