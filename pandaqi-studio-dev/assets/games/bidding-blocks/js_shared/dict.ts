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
    tint?: string,
    fitsOnTop?: Suit[]
}

const TEMPLATES:Record<Suit, GeneralData> =
{
    [Suit.FLOOR]: { frame: 0, tint: "#614300", fitsOnTop: [Suit.STAIRS] },
    [Suit.WALL]: { frame: 1, tint: "#005850", fitsOnTop: [Suit.FLOOR] },
    [Suit.STAIRS]: { frame: 2, tint: "#4c00b7", fitsOnTop: [Suit.FLOOR] },
    [Suit.ROOF]: { frame: 3, tint: "#c12358", fitsOnTop: [Suit.WALL, Suit.STAIRS] }
}

export {
    Suit,
    TEMPLATES
};