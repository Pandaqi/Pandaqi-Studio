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
    win_all: { frame: 0, score: 200, label: "Win All", desc: "My score this round (without this bid) is higher than anyone else.", bonusBid: true },
    win_none: { frame: 1, score: 200, label: "Win None", desc: "I don't have <b>any</b> of the possible bids this round.", bonusBid: true },

    one_pair: { frame: 2, score: 20, label: "One Pair", desc: "1 pair. (Pair means two cards with the same number.)" },
    two_pair: { frame: 3, score: 50, label: "Two Pairs", desc: "2 pairs. (Pair means two cards with the same number.)" },
    three_pair: { frame: 4, score: 100, label: "Three Pairs", desc: "3 pairs. (Pair means two cards with the same number.)" },

    one_trio: { frame: 5, score: 40, label: "One Trio", desc: "1 Trio. (Trio means three cards with the same number.)" },
    two_trio: { frame: 6, score: 80, label: "Two Trio", desc: "2 Trio. (Trio means three cards with the same number.)" },
    three_trio: { frame: 7, score: 120, label: "Three Trio", desc: "3 Trio. (Trio means three cards with the same number.)" },

    straight_short: { frame: 8, score: 50, label: "Short Street", desc: "3 cards in numerical order." },
    straight_mid: { frame: 9, score: 100, label: "Medium Street", desc: "5 cards in numerical order." },
    straight_long: { frame: 10, score: 150, label: "Long Street", desc: "7 cards in numerical order." },

    flush_short: { frame: 11, score: 30, label: "Short Group", desc: "4 cards of the same suit." },
    flush_mid: { frame: 12, score: 90, label: "Medium Group", desc: "6 cards of the same suit." },
    flush_long: { frame: 13, score: 180, label: "Long Group", desc: "8 cards of the same suit." },

    full_house_regular: { frame: 14, score: 60, label: "Full House", desc: "1 pair and 1 trio." },
    full_house_medium: { frame: 15, score: 100, label: "Full Villa", desc: "2 pairs and 1 trio." },
    full_house_long: { frame: 16, score: 140, label: "Full Mansion", desc: "2 pairs and 2 trios." },
    full_house_extreme: { frame: 17, score: 180, label: "Full Estate", desc: "3 pairs and 2 trios." },
    
    high_card: { frame: 18, score: 10, label: "High Card", desc: "The highest card in the game." },
    low_card: { frame: 19, score: 10, label: "Low Card", desc: "The lowest card in the game." },

    straight_flush_short: { frame: 20, score: 30, label: "Short Band", desc: "2 cards in numerical order <b>and</b> of the same suit." },
    straight_flush_mid: { frame: 21, score: 60, label: "Medium Band", desc: "3 cards in numerical order <b>and</b> of the same suit." },
    straight_flush_long: { frame: 22, score: 120, label: "Long Band", desc: "5 cards in numerical order <b>and</b> of the same suit." },
    straight_flush_extreme: { frame: 23, score: 160, label: "Superlong Band", desc: "6 cards in numerical order <b>and</b> of the same suit." },

    majority_sparrows: { frame: 24, score: 50, label: "Sparrows Majority", desc: "I have more Sparrows cards than anyone else." },
    majority_parrots: { frame: 25, score: 50, label: "Parrots Majority", desc: "I have more Parrots cards than anyone else." },
    majority_eagles: { frame: 26, score: 50, label: "Eagles Majority", desc: "I have more Eagles cards than anyone else." },
    majority_chickens: { frame: 27, score: 50, label: "Chickens Majority", desc: "I have more Chickens cards than anyone else." },

    flush_hand: { frame: 28, score: 100, label: "Hand Group", desc: "My entire hand is the same suit." },
    no_duplicates: { frame: 29, score: 80, label: "No Duplicates", desc: "<b>No</b> number from the table appears in your hand too." },
    one_quatro: { frame: 30, score: 80, label: "One Quatro", desc: "1 Quatro. (Quatro means all four cards of the same number.)" },
    two_quatro: { frame: 31, score: 160, label: "Two Quatro", desc: "2 Quatros. (Quatro means all four cards of the same number.)" },
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