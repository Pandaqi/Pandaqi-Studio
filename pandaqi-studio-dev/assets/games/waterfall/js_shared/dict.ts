
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
    score: { desc: "<b>Score</b> a tile.", default: true },
    draw: { desc: "<b>Draw</b> a tile.", default: true },
    add: { desc: "<b>Add</b> a tile to the waterfall.", default: true }
}

const GATES:Record<string, GeneralData> =
{

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
    WaterFlow
};

