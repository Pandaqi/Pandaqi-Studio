import Point from "js/pq_games/tools/geometry/point"

enum CardType
{
    CONTRACT,
    CARD,
    SPECIAL
}

const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const NUMBERS_AS_STRINGS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS =
{
    hearts: { frame: 0 },
    diamonds: { frame: 1 },
    clubs: { frame: 2 },
    spades: { frame: 3 }
}

interface ContractData
{
    frame?: number,
    desc: string,
    freq?: number,
    set?: string,
    score?: number
}

// General rule for SCORING them
// - "any" actions are MUCH easier than specific ones
// - actions that require MORE CARDS to work are generally HARDER
// - scoring ranges from 1--10
// - LOW scoring actions have HIGH scoring penalties (to punish you for screwing up something that easy; also to incentivize players to take risks, because high scoring ones thus have LOW penalties).

const CONTRACTS:Record<string,ContractData> =
{
    // the base game contracts are very much based on Poker hands
    // just with that extra dimension (playing on 2D map, more cards) added
    one_number: { desc: "A card with number %number%.", score: 1 },
    one_suit: { desc: "A card with suit %suit%.", score: 1 },
    
    pair_any: { desc: "Two cards of the same number.", score: 1 },
    pair_adjacent_any: { desc: "Two cards of the same number adjacent to each other.", score: 3 },
    pair: { desc: "Two %number%s.", score: 4 },
    pair_adjacent: { desc: "Two %number%s adjacent to each other.", score: 5 },

    trio_any: { desc: "Three cards of the same number.", score: 3 },
    trio_adjacent_any: { desc: "Three cards of the same number are adjacent to each other.", score: 6 },
    trio: { desc: "Three %number%s.", score: 5 },

    pair_double_any: { desc: "Two pairs. (A pair means two cards of the same number.)", score: 3 },
    pair_double: { desc: "A pair of %number%s and a pair of %number%s.", score: 6 },
    four_number_any: { desc: "Four cards of the same number.", score: 6 },
    four_number: { desc: "Four %number%s.", score: 9 }, // @TODO: what to do with these highly specific ones? Provide more options for the numbers/suits? Make them appear less frequently?
    four_suit_any: { desc: "Four cards of the same suit.", score: 3 },
    four_suit: { desc: "Four cards of the suit %suit%.", score: 4 },

    straight: { desc: "Five cards in numerical order.", score: 3 },
    straight_adjacent: { desc: "Five cards in numerical order are adjacent to each other.", score: 6 },
    straight_restricted: { desc: "Five cards in numerical order, which starts lower than (or at) %number%.", score: 6 },
    flush_any: { desc: "Five cards of the same suit.", score: 5 },
    flush: { desc: "Five cards of the suit %suit%.", score: 7 },

    full_house: { desc: "A pair ( = two cards of same number) and a trio ( = three cards of the same number)", score: 4 },
    trio_double_any: { desc: "Two trios. (A trio means three cards of the same number.)", score: 6 },
    trio_double: { desc: "A trio of %number%s and a trio of %number%s.", score: 9 },

    straight_flush_any: { desc: "Five cards in numerical order AND of the same suit.", score: 8 },
    straight_flush: { desc: "Five cards in numerical order AND of suit %suit%.", score: 9 },
    royal_flush: { desc: "Five cards in numerical order AND of the same suit, ending in the highest number in the game", score: 10 },

    row_suit_any: { desc: "Three cards of the same suit are in the same row.", score: 3 },
    row_number_any: { desc: "Three cards with the same number are in the same row.", score: 6 },
    row_suit: { desc: "Three cards of suit %suit% are in the same row", score: 5 },
    row_number: { desc: "Three %number%s are in the same row", score: 7 },

    variety_suit: { desc: "All suits in the game appear.", score: 2 },
    variety_suit_adjacent: { desc: "All suits in the game appear adjacent to each other.", score: 4 },
    variety_number: { desc: "All numbers in the game appear.", score: 6 },
    variety_row: { desc: "One row contains all suits in the game.", score: 4 },
    variety_suit_row_lack: { desc: "One row contains only one unique suit.", score: 3 },
    variety_number_row_lack: { desc: "One row contains only one unique number.", score: 2 },
    variety_both_row_lack: { desc: "One row contains only cards of the same suit AND the same number.", score: 5 },

    // straightShake expansion; the more weird/chaotic/hard to understand contracts
    // @TODO: they also get a permanent power/curse/ability (which helps fulfill them too)
    number_restriction: { desc: "No number lower than 6 appears.", score: 6, set: "straightShake" },
    contracts_success: { desc: "All other players FULFILL their contract.", score: 6, set: "straightShake" },
    contracts_fail: { desc: "At least one other player FAILS their contract.", score: 3, set: "straightShake" },

    variety_number_inverse: { desc: "At most 5 unique numbers appear.", score: 4, set: "straightShake" },
    variety_suit_inverse: { desc: "At least one suit (in the game) doesn't appear.", score: 6, set: "straightShake" },

    discard_count_free: { desc: "At least one card has been discarded.", score: 2, set: "straightShake" },
    discard_count_strict: { desc: "Exactly two cards have been discarded.", score: 6, set: "straightShake" },
    discard_dealer: { desc: "The Dealer has discarded at least one card.", score: 1, set: "straightShake" },
    discard_type: { desc: "A card of suit %suit% is on top of the discard pile.", score: 4, set: "straightShake" },
    discard_number: { desc: "A card with number %number% is on top of the discard pile.", score: 7, set: "straightShake" },
    discard_complete_fail: { desc: "One player has not played ANY card this round.", score: 7, set: "straightShake" }
}

const DYNAMIC_OPTIONS =
{
    "%number%": [], // filled in dynamically from config, as not necessarily all options are in the generated game
    "%suit%": [],
    "%suitImageStrings%": [],
}

const SPECIAL_CARDS:Record<string,ContractData> = 
{
    switch_contract: { frame: 0, desc: "Switch your contract with another player." },
    ditch_contract: { frame: 1, desc: "Discard your contract." },
    ditch_contract_other: { frame: 2, desc: "Force another player to discard their contract." },
    study_hidden: { frame: 3, desc: "Study the facedown cards." },
    study_hand: { frame: 4, desc: "Study another player's hand." },
    draw_card: { frame: 5, desc: "Draw an extra card into your hand." },
    draw_card_all: { frame: 6, desc: "All players draw an extra card." },
    steal_card: { frame: 7, desc: "Steal 1 card from another player." },
    play_another_free: { frame: 8, desc: "Play another card, ignoring the placement rules." },
    play_another_top: { frame: 9, desc: "Play another card on TOP of an existing card." },
    wildcard_suit: { frame: 10, desc: "Pick a suit. It's now a wildcard: it can represent ANY suit you want." },
    wildcard_number: { frame: 11, desc: "Pick a number. It's now a wildcard: it can represent ANY number you want." },
}

export 
{
    CardType,
    SUITS,
    NUMBERS,
    NUMBERS_AS_STRINGS,
    CONTRACTS,
    SPECIAL_CARDS,
    DYNAMIC_OPTIONS
}
