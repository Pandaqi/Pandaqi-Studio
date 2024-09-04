import Point from "js/pq_games/tools/geometry/point"

enum CardType
{
    REGULAR,
    BID,
    TOKEN,
}

enum Suit
{
    SPARROW = "sparrow",
    PARROT = "parrot",
    EAGLE = "eagle",
    CHICKEN = "chicken"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    bonusBid?: boolean,
    score?: number,
    inkFriendlyHide?: boolean,
    noOverlay?: boolean,
    tint?: string
}

const BID_CARDS:Record<string, GeneralData> =
{
    win_all: { frame: 0, score: 200, label: "Win All", desc: "My score this round <i>(without this bid)</i> is <b>higher than anyone</b> else.", bonusBid: true },
    win_none: { frame: 1, score: 200, label: "Win None", desc: "I don't have <b>any</b> of the possible bids this round.", bonusBid: true },

    one_pair: { frame: 2, score: 20, label: "One Pair", desc: "<b>1 Pair.</b> <i>(Pair means two cards with the same number.)</i>" },
    two_pair: { frame: 3, score: 50, label: "Two Pairs", desc: "<b>2 Pairs.</b> <i>(Pair means two cards with the same number.)</i>" },
    three_pair: { frame: 4, score: 100, label: "Three Pairs", desc: "<b>3 Pairs.</b> <i>(Pair means two cards with the same number.)</i>" },

    one_trio: { frame: 5, score: 40, label: "One Trio", desc: "<b>1 Trios.</b> <i>(Trio means three cards with the same number.)</i>" },
    two_trio: { frame: 6, score: 80, label: "Two Trio", desc: "<b>2 Trios.</b> <i>(Trio means three cards with the same number.)</i>" },
    three_trio: { frame: 7, score: 120, label: "Three Trio", desc: "<b>3 Trio.</b> <i>(Trio means three cards with the same number.)</i>" },

    straight_short: { frame: 8, score: 50, label: "Short Street", desc: "3 cards in <b>numerical order</b>." },
    straight_mid: { frame: 9, score: 100, label: "Medium Street", desc: "5 cards in <b>numerical order</b>." },
    straight_long: { frame: 10, score: 150, label: "Long Street", desc: "7 cards in <b>numerical order</b>." },

    flush_short: { frame: 11, score: 30, label: "Short Group", desc: "4 cards of the <b>same suit</b>." },
    flush_mid: { frame: 12, score: 90, label: "Medium Group", desc: "6 cards of the <b>same suit</b>." },
    flush_long: { frame: 13, score: 180, label: "Long Group", desc: "8 cards of the <b>same suit</b>." },

    full_house_regular: { frame: 14, score: 60, label: "Full House", desc: "<b>1 Pair</b> and <b>1 Trio</b>." },
    full_house_medium: { frame: 15, score: 100, label: "Full Villa", desc: "<b>2 Pairs</b> and <b>1 Trio</b>." },
    full_house_long: { frame: 16, score: 140, label: "Full Mansion", desc: "<b>2 Pairs</b> and <b>2 Trios</b>." },
    full_house_extreme: { frame: 17, score: 180, label: "Full Estate", desc: "<b>3 Pairs</b> and <b>2 Trios</b>." },
    
    high_card: { frame: 18, score: 10, label: "High Card", desc: "The <b>highest</b> card in the game." },
    low_card: { frame: 19, score: 10, label: "Low Card", desc: "The <b>lowest</b> card in the game." },

    straight_flush_short: { frame: 20, score: 30, label: "Short Band", desc: "2 cards in <b>numerical order</b> <i>and</i> of the <b>same suit</b>." },
    straight_flush_mid: { frame: 21, score: 60, label: "Medium Band", desc: "3 cards in <b>numerical order</b> <i>and</i> of the <b>same suit</b>." },
    straight_flush_long: { frame: 22, score: 120, label: "Long Band", desc: "5 cards in <b>numerical order</b> <i>and</i> of the <b>same suit</b>." },
    straight_flush_extreme: { frame: 23, score: 160, label: "Superlong Band", desc: "6 cards in <b>numerical order</b> <i>and</i> of the <b>same suit</b>." },

    majority_sparrows: { frame: 24, score: 50, label: "Sparrows Majority", desc: "I have more <b>Sparrows</b> cards than anyone else." },
    majority_parrots: { frame: 25, score: 50, label: "Parrots Majority", desc: "I have more <b>Parrots</b> cards than anyone else." },
    majority_eagles: { frame: 26, score: 50, label: "Eagles Majority", desc: "I have more <b>Eagles</b> cards than anyone else." },
    majority_chickens: { frame: 27, score: 50, label: "Chickens Majority", desc: "I have more <b>Chickens</b> cards than anyone else." },

    flush_hand: { frame: 28, score: 100, label: "Hand Group", desc: "My entire hand is the <b>same suit</b>." },
    no_duplicates: { frame: 29, score: 80, label: "No Duplicates", desc: "<b>No</b> number from the table appears in your hand too." },
    one_quatro: { frame: 30, score: 80, label: "One Quatro", desc: "<b>1 Quatro.</b> <i>(Quatro means all four cards of the same number.)</i>" },
    two_quatro: { frame: 31, score: 160, label: "Two Quatro", desc: "<b>2 Quatros.</b> <i>(Quatro means all four cards of the same number.)</i>" },
}

const MISC:Record<string, GeneralData> =
{
    [Suit.SPARROW]: { frame: 0, tint: "#489347" },
    [Suit.PARROT]: { frame: 1, tint: "#ad0000" },
    [Suit.EAGLE]: { frame: 2, tint: "#323cdf" },
    [Suit.CHICKEN]: { frame: 3, tint: "#777519" },
    bonus_bid: { frame: 4 }
}

const TEMPLATES:Record<string, GeneralData> =
{
    regular: { frame: 0, inkFriendlyHide: true },
    bid: { frame: 1, inkFriendlyHide: false, noOverlay: true },
    token: { frame: 2, inkFriendlyHide: false },
    overlay: { frame: 3 }
}

const NUMBER_INDICES = 
[
    new Point(-1,-1), new Point(0,-1), new Point(1,-1), // 3rd row (0-2)
    new Point(-1,-0.66), new Point(0, -0.66), new Point(1, -0.66), // 2nd row (3-5)
    new Point(-1,-0.33), new Point(0, -0.33), new Point(1, -0.33), // 1st row (6-8)
    new Point(-1, 0), new Point(0,0), new Point(1,0), // 0th row = center line of card (9-11)
    new Point(-1, 0.33), new Point(0,  0.33), new Point(1,  0.33), // 1st row (12-14)
    new Point(-1, 0.66), new Point(0,  0.66), new Point(1,  0.66), // 2nd row (15-17)
    new Point(-1, 1), new Point(0, 1), new Point(1, 1), // 3rd row (18-20)
]

const NUMBER_ARRANGEMENTS =
[
    [],
    [10],
    [1, 19],
    [1, 10, 19],
    [0, 2, 18, 20],
    [0, 2, 10, 18, 20],
    [0, 2, 9, 11, 18, 20],
    [0, 2, 4, 9, 11, 18, 20],
    [0, 2, 4, 9, 11, 16, 18, 20],
    [0, 2, 6, 8, 10, 12, 14, 18, 20],
    [0, 2, 4, 6, 8, 12, 14, 16, 18, 20],
]


export {
    Suit,
    CardType,
    MISC,
    TEMPLATES,
    BID_CARDS,
    NUMBER_INDICES,
    NUMBER_ARRANGEMENTS
};