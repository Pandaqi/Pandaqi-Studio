
enum Suit
{
    RED = "red",
    BLUE = "blue",
    GREEN = "green",
    PURPLE = "purple",
    YELLOW = "yellow",
    BLACK = "black"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    value?: number, // for the unique values/ids of the special bids
}

// @NOTE: In a 3-player game, there will only be 12 dice results (4 per player x 3) anyway. In a 2-player game, only 8! 
// - As such, any bids that require near 12 cards OR have a value above that are practically useless anyway. I've only used these for "unicorns": hail maries that are your last risky bet if needed.
// - Also, we skipped the "quintet" (5 of a kind) just to conserve space and not make the list too long.
// - The bids are arranged to have a nice pattern where the number (say 2 pairs) usually matches the value in some multiple (2); don't accidentally reorder and ruin this!
const SPECIAL_BIDS:Record<string,GeneralData> =
{
    two_pairs: { frame: 0, value: 2, label: "Two Pairs", desc: "<b>Two numbers</b> appear <b>two times</b> each." },
    two_trios: { frame: 1, value: 3, label: "Two Trios", desc: "<b>Two numbers</b> appear <b>three times</b> each." },
    three_pairs: { frame: 2, value: 4, label: "Three Pairs", desc: "<b>Three numbers</b> appear <b>two times</b> each." },
    full_house: { frame: 3, value: 5, label: "Full House", desc: "<b>One number</b> appears twice, <b>another number</b> appears thrice." },
    three_trios: { frame: 4, value: 6, label: "Three Trios", desc: "<b>Three numbers</b> appear <b>three times</b> each." },
    full_mansion: { frame: 5, value: 7, label: "Full Mansion", desc: "<b>One number</b> appears thrice, <b>another number</b> appears five times." },
    two_quatros: { frame: 6, value: 8, label: "Two Quatros", desc: "<b>Two numbers</b> appear <b>four times</b> each." },
    straight_flush: { frame: 7, value: 9, label: "Straight Flush", desc: "<b>Four cards</b> of the same <i>color</i> <b>and</b> <i>in numeric order</i>." },
    three_quatros: { frame: 8, value: 10, label: "Three Quatros", desc: "<b>Three numbers</b> appear <b>four times</b> each." },
    straight_ocean: { frame: 9, value: 11, label: "Straight Ocean", desc: "<b>Six cards</b> of the same <i>color</i> <b>and</b> <i>in numeric order</i>." },
    two_sextets: { frame: 10, value: 12, label: "Two Sextets", desc: "<b>Two numbers</b> appear <b>six times</b> each." },
    unicorn_rainbow: { frame: 11, value: 13, label: "Unicorn Rainbow", desc: "Name the <b>exact colors</b> (and their quantities) rolled." },
    unicorn_number: { frame: 12, value: 14, label: "Unicorn Math", desc: "Name the <b>exact numbers</b> (and their quantities) rolled." },
}

const MISC:Record<string, GeneralData> =
{

}

export 
{
    MISC,
    Suit,
    SPECIAL_BIDS,
}