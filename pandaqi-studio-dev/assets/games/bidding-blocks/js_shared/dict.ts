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
}

const MISC:Record<string, GeneralData> =
{

}

export {
    Suit,
    MISC
};