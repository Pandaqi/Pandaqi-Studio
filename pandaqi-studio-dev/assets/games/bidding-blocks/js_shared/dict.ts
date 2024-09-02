enum Suit
{
    FLOOR = "floor",
    WALL = "wall",
    STAIRS = "stairs",
    ROOF = "roof"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    tint?: string
}

const TEMPLATES:Record<Suit, GeneralData> =
{
    [Suit.FLOOR]: { frame: 0, tint: "#614300" },
    [Suit.WALL]: { frame: 1, tint: "#005850" },
    [Suit.STAIRS]: { frame: 2, tint: "#4c00b7" },
    [Suit.ROOF]: { frame: 3, tint: "#c12358" }
}

export {
    Suit,
    TEMPLATES
};