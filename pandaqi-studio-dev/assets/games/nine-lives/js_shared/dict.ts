
enum Type
{
    LIFE = "LIFE",
    CAT = "CAT"
}

interface PowerData
{
    label?:string,
    frame?: number, // default frame in default spritesheet, applicable to MOST (non-dynamic) powers
    drawNum?: number, // how many cards you may draw at end of turn
    reqs?:string[] // any requirements that should be dynamically filled in
}

type PowerSet = Record<string, PowerData>;
const POWERS:PowerSet = 
{
    skip: { label: "Skip Turn", drawNum: 2, frame: 0 },
    copycat: { label: "Copycat", drawNum: 1, frame: 1 },
    wildcard: { label: "Wildcard", drawNum: 1, frame: 2 },
    wildcard_paid: { label: "Wildcard Paid", drawNum: 2, frame: 3 },
    override: { label: "Replace", drawNum: 2, frame: 4 },
    swap: { label: "Swap", drawNum: 2, frame: 5 },
    steal: { label: "Steal", drawNum: 1, frame: 6 },
    risky_deck: { label: "Draw and Play", drawNum: 1, frame: 7 },
    risky_player: { label: "Steal and Play", drawNum: 1, frame: 8 },
    double_turn: { label: "Double Turn", drawNum: 2, frame: 9 },
    rotate_cards: { label: "Card Carousel", drawNum: 2, frame: 10 }, // everyone gives 2 cards to the left/right
    inspect: { label: "Inspect", drawNum: 2, frame: 11 }, // look at the hand of 2 other players.

    shapeshift: { label: "Shapeshift", reqs: ["cat", "cat"], drawNum: 2 },
    ignore: { label: "Ignore", reqs: ["cat"], drawNum: 1 },
    cat_plus: { label: "More Allowed", reqs: ["cat"], drawNum: 2 },
}

interface CatData
{
    frame: number,
    color: string,
    excludeFromCombos?: boolean
}

const CATS: Record<string, CatData> = 
{
    circle: { frame: 0, color: "#145C00" }, // frame + 1 is the simplified version
    square: { frame: 2, color: "#084670" },
    triangle: { frame: 4, color: "#802D12" },
    star: { frame: 6, color: "#3A236D", excludeFromCombos: true }
}

const MISC =
{
    bg_cat: { frame: 0 },
    heart: { frame: 1 },
    heart_simple: { frame: 2 },
    heart_outline: { frame: 3 },
    heart_life: { frame: 4 },
    cross: { frame: 5 },
    arrow: { frame: 6 },
    card: { frame: 7 },
    plus: { frame: 8 }
}

export 
{
    Type,
    PowerData,
    CATS,
    POWERS,
    MISC
}
