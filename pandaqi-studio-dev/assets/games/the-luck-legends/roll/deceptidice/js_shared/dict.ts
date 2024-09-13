
enum Suit
{
    RED = "red",
    BLUE = "blue",
    GREEN = "green",
    PURPLE = "purple",
    YELLOW = "yellow",
    TURQUOISE = "turquoise",
    BLACK = "black"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    value?: number, // for the unique values/ids of the special bids
    tint?: string,
}

type GeneralDict = Record<string,GeneralData>;

// @NOTE: In a 3-player game, there will only be 12 dice results (4 per player x 3) anyway. In a 2-player game, only 8! 
// - As such, any bids that require near 12 cards OR have a value above that are practically useless anyway. I've only used these for "unicorns": hail maries that are your last risky bet if needed.
// - Also, we skipped the "quintet" (5 of a kind) just to conserve space and not make the list too long.
// - The bids are arranged to have a nice pattern where the number (say 2 pairs) usually matches the value in some multiple (2); don't accidentally reorder and ruin this!
const SPECIAL_BIDS:GeneralDict =
{
    two_pairs: { frame: 0, value: 2, label: "Two Pairs", desc: "<b>Two numbers</b> appear <b>two times</b> each." },
    two_trios: { frame: 1, value: 3, label: "Two Trios", desc: "<b>Two numbers</b> appear <b>three times</b> each." },
    three_pairs: { frame: 2, value: 4, label: "Three Pairs", desc: "<b>Three numbers</b> appear <b>two times</b> each." },
    full_house: { frame: 3, value: 5, label: "Full House", desc: "<b>One number</b> appears twice, <b>another number</b> appears thrice." },
    three_trios: { frame: 4, value: 6, label: "Three Trios", desc: "<b>Three numbers</b> appear <b>three times</b> each." },
    full_mansion: { frame: 5, value: 7, label: "Full Mansion", desc: "<b>One number</b> appears thrice, <b>another number</b> appears four times." },
    two_quatros: { frame: 6, value: 8, label: "Two Quatros", desc: "<b>Two numbers</b> appear <b>four times</b> each." },
    straight_flush: { frame: 7, value: 10, label: "Straight Flush", desc: "<b>Three cards</b> of the same <i>color</i> <b>and</b> <i>in numeric order</i>." },
    straight_sea: { frame: 8, value: 12, label: "Straight Sea", desc: "<b>Four cards</b> of the same <i>color</i> <b>and</b> <i>in numeric order</i>." },
    full_estate: { frame: 10, value: 15, label: "Full Estate", desc: "<b>One number</b> appears four times, <b>another number>/b appears five times." },
    straight_ocean: { frame: 9, value: 17, label: "Straight Ocean", desc: "<b>Five cards</b> of the same <i>color</i> <b>and</b> <i>in numeric order</i>." },
    unicorn: { frame: 11, value: 20, label: "Unicorn", desc: "Name the <b>exact colors</b> <i>or</i> <b>exact numbers</b> (and their quantities) rolled." },
}

// @TODO: Use the fact that there can be DUPLICATE CARDS now (there are multiple Red 2's, for example)? For some special bid or something?

const SUITS:GeneralDict =
{
    [Suit.RED]: { tint: "#FF0000" },
    [Suit.BLUE]: { tint: "#0000FF" },
    [Suit.GREEN]: { tint: "#00FF00" },
    [Suit.PURPLE]: { tint: "#FF00FF" },
    //[Suit.YELLOW]: { tint: "#FFFF00" },
    //[Suit.TURQUOISE]: { tint: "#00FFFF" },
    //[Suit.BLACK]: { tint: "#AAAAAA" }
}

const MISC:GeneralDict =
{

}

export 
{
    MISC,
    Suit,
    SPECIAL_BIDS,
    SUITS,
    GeneralDict
}