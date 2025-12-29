import { Vector2 } from "lib/pq-games";
import { DrawGroup } from "../game/drawDynamicContract";

export enum CardType
{
    CONTRACT,
    CARD,
    SPECIAL
}

export const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13];
export const NUMBERS_AS_STRINGS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUITS =
{
    hearts: { frame: 0, color: "#A30606" },
    diamonds: { frame: 1, color: "#A30606" },
    clubs: { frame: 2, color: "#1C1C1C" },
    spades: { frame: 3, color: "#1C1C1C" }
}

// How to draw a card's icons; all coordinates relative to center
export const ICON_ARRANGEMENTS = 
{
    1: [new Vector2()],
    2: [new Vector2(-1,1), new Vector2(1,-1)],
    3: [new Vector2(-1,1), new Vector2(), new Vector2(1,-1)],
    4: [new Vector2(-1,-1), new Vector2(1,-1), new Vector2(1,1), new Vector2(-1,1)],
    5: [new Vector2(-1,-1), new Vector2(1,-1), new Vector2(), new Vector2(1,1), new Vector2(-1,1)],
    6: [new Vector2(-1,-1), new Vector2(1,-1), new Vector2(-1,0), new Vector2(1,0), new Vector2(1,1), new Vector2(-1,1)],
    7: [
        new Vector2(-1,-1), new Vector2(0,-0.5), new Vector2(1,-1), 
        new Vector2(-1,0), new Vector2(1,0), 
        new Vector2(-1,1), new Vector2(1,1)
    ],
    8: [
        new Vector2(-1,-1), new Vector2(0,-0.5), new Vector2(1,-1),
        new Vector2(-1,0), new Vector2(1,0), 
        new Vector2(-1,1), new Vector2(0,0.5), new Vector2(1,1)
    ],
    9: [
        new Vector2(-1,-1.35), new Vector2(1,-1.35), 
        new Vector2(-1, -0.35), new Vector2(0,-0.85), new Vector2(1,-0.35), 
        new Vector2(-1,0.35), new Vector2(1,0.35), 
        new Vector2(-1,1.35), new Vector2(1,1.35)
    ],
    10: [
        new Vector2(-1,-1.35), new Vector2(1,-1.35), 
        new Vector2(-1, -0.35), new Vector2(0,-0.85), new Vector2(1,-0.35), 
        new Vector2(-1,0.35), new Vector2(0,0.85), new Vector2(1,0.35), 
        new Vector2(-1,1.35), new Vector2(1,1.35)
    ],
}

export const CARD_TEMPLATES =
{
    [CardType.CARD]: { frame: 0 },
    [CardType.SPECIAL]: { frame: 1 },
    [CardType.CONTRACT]: { frame: 2 },
}

export const MISC = 
{
    banner: { frame: 0 },
    union_or: { frame: 1 }, // a "/"
    union_and: { frame: 2 }, // a "+"
    suit_any_same: { frame: 3 }, // all four suits mashed into one symbol
    number_any_same: { frame: 4 }, // just a question mark or hashtag, decorated
    adjacent: { frame: 5 }, // straight double arrow between cards
    numeric: { frame: 6 }, // a bent arrow over the top---between cards---with a  "+1" over it
    invert_cross: { frame: 7 }, // a red slash / cross / stop-sign
    same_row: { frame: 8 }, // a few cards aligned horizontally, to be displayed below entire set
    undefined_length_1: { frame: 9 }, // option 1 for undefined length: fade out
    undefined_length_2: { frame: 10 }, // option 2 for undefined length: dot dot dot
    discard_pile: { frame: 11 }, // a pile rectangle + discard arrow
}

interface ContractData
{
    frame?: number,
    desc: string,
    freq?: number,
    set?: string,
    score?: number,
    rule?: string,
    label?: string,
    drawDetails?: DrawGroup[]
}

// @NOTE: scores were filled in after doing 10,000 games simulation. They should be "perfect" for the cards, so none are manually chosen by me anymore.
export const CONTRACTS:Record<string,ContractData> =
{
    // the base game contracts are very much based on Poker hands
    // just with that extra dimension (playing on 2D map, more cards, adjacency) added
    one_number: { desc: "A card with <b>number %number%</b>.", score: 2, drawDetails: [new DrawGroup().addCard({ number: 0 })] },
    one_suit_options_number: { desc: "A card with <b>suit %suit%</b> and <b>number %number%, %number% or %number%</b>.", score: 3, drawDetails: [new DrawGroup().addCard({ suit: 0, number: [1,2,3] })] },
    
    pair_with_suits_any: { desc: "<b>Two</b> cards of the same number, with suits %suit% and %suit%", score: 3, drawDetails: [new DrawGroup().addCards({ suit: 0, number: -1 }, { suit: 1, number: -1 })] },
    pair_with_suits_adjacent_any: { desc: "<b>Two</b> cards of the same number, <b>adjacent</b>, with suits %suit% and %suit%", score: 7, drawDetails: [new DrawGroup().addCards({ suit: 0, number: -1 }, { suit: 1, number: -1 }).setAdjacent(true)] },
    pair: { desc: "One of these numbers <b>appears two times: %number% or %number%</b>.", score: 3, drawDetails: [new DrawGroup().addCard({ number: 0 }, 2), new DrawGroup().addCard({ number: 1 }, 2)] },
    pair_adjacent: { desc: "One of these numbers <b>appears two times, adjacent</b> to each other: <b>%number% or %number%</b>.", score: 7, drawDetails: [new DrawGroup().addCard({ number: 0 }, 2).setAdjacent(true), new DrawGroup().addCard({ number: 1 }, 2).setAdjacent(true)] },

    trio_any: { desc: "<b>Three</b> cards of the same number.", score: 2, drawDetails: [new DrawGroup().addCard({ number: -1 }, 3)] },
    trio_with_suits_any: { desc: "<b>Three</b> cards of the same number <em>and</em> <b>not with suit %suit%</b>.", score: 6, drawDetails: [new DrawGroup().addCard({ number: -1, suit: 0, suitInvert: true }, 3)] },
    trio_adjacent_any: { desc: "<b>Three</b> cards of the same number are <b>adjacent</b>.", score: 8, drawDetails: [new DrawGroup().addCard({ number: -1 }, 3).setAdjacent(true)] },
    trio: { desc: "One of these numbers <b>appears three times: %number%, %number% or %number%</b>.", score: 6, drawDetails: [new DrawGroup().addCard({ number: 0 }, 3), new DrawGroup().addCard({ number: 1 }, 3), new DrawGroup().addCard({ number: 2 }, 3)] },

    pair_double_with_suits_any: { desc: "<b>Two pairs</b> with suits %suit% and %suit%.", score: 6, drawDetails: [new DrawGroup().addCard({ suit: 0 }, 2).setUnion("and"), new DrawGroup().addCard({ suit: 1 }, 2)] },
    pair_double: { desc: "A <b>pair of %number%s</b> <em>and</em> a <b>pair of %number%s</b>.", score: 8, drawDetails: [new DrawGroup().addCard({ number: 0 }, 2).setUnion("and"), new DrawGroup().addCard({ number: 1 }, 2)] },
    
    four_number_any: { desc: "<b>Four</b> cards of the same number.", score: 8, drawDetails: [new DrawGroup().addCard({ number: -1 }, 4)] },
    four_number: { desc: "One of these numbers <b>appears four times: %number%, %number%, %number% or %number%</b>.", score: 9, drawDetails: [new DrawGroup().addCard({ number: 0 }, 4), new DrawGroup().addCard({ number: 1 }, 4), new DrawGroup().addCard({ number: 2 }, 4), new DrawGroup().addCard({ number: 3 }, 4)] },
    four_suit_adjacent_any: { desc: "<b>Four</b> cards of the <b>same suit, adjacent</b>.", score: 5, drawDetails: [new DrawGroup().addCard({ suit: -1 }, 4).setAdjacent(true)] },
    four_suit: { desc: "<b>Four</b> cards of the suit %suit%.", score: 5, drawDetails: [new DrawGroup().addCard({ suit: 0 }, 4)] },

    straight: { desc: "<b>Five</b> cards in numerical <b>order</b>.", score: 4, drawDetails: [new DrawGroup().addCardsNumeric(5)] },
    straight_adjacent: { desc: "<b>Three</b> cards in numerical <b>order</b> are <b>adjacent</b>.", score: 7, drawDetails: [new DrawGroup().addCardsNumeric(3).setAdjacent(true)] },
    straight_restricted: { desc: "<b>Four</b> cards in numerical <b>order</b>, which starts lower than (or at) %numbermid%.", score: 4, drawDetails: [new DrawGroup().addCardsNumeric(4, { number: 0 })] },
    flush_any: { desc: "<b>Five</b> cards of the <b>same suit</b>.", score: 3, drawDetails: [new DrawGroup().addCard({ suit: -1 }, 5)] },
    flush: { desc: "<b>Five</b> cards of the <b>suit %suit%</b>.", score: 7, drawDetails: [new DrawGroup().addCard({ suit: 0}, 5)] },

    full_house_any: { desc: "A <b>pair</b> and a <b>trio</b>.", score: 2, drawDetails: [new DrawGroup().addCard({ number: -1 }, 2).setUnion("and"), new DrawGroup().addCard({ number: -1 }, 3)] },
    full_house_adjacent: { desc: "A <b>pair</b> and a <b>trio</b>, which are <b>adjacent</b>.", score: 2, drawDetails: [new DrawGroup().addCard({ number: -1 }, 2).setUnion("and").setAdjacent(true), new DrawGroup().addCard({ number: -1 }, 3).setAdjacent(true)] },
    full_house: { desc: "A <b>pair</b> and a <b>trio</b> from these possible numbers: %number%, %number%, %number%, %number%.", score: 6, drawDetails: [new DrawGroup().addCard({ number: [0,1,2,3] }, 2), new DrawGroup().addCard({ number: [0,1,2,3] }, 3)] },

    trio_double_any: { desc: "<b>Two trios</b>.", score: 5, drawDetails: [new DrawGroup().addCard({ number: - 1}, 3).setUnion("and"), new DrawGroup().addCard({ number: -1}, 3)] },
    trio_double_with_suits_any: { desc: "<b>Two trios</b>, but <b>not with suit %suit%</b>.", score: 9, drawDetails: [new DrawGroup().addCard({ number: -1, suit: 0, suitInvert: true }, 3).setUnion("and"), new DrawGroup().addCard({ number: -1, suit: 0, suitInvert: true }, 3)] },
    trio_double: { desc: "<b>Two</b> of these numbers <b>appear three times: %number%, %number%, %number% or %number%</b>.", score: 9, drawDetails: [new DrawGroup().addCard({ number: [0,1,2,3] }, 3).setUnion("and"), new DrawGroup().addCard({ number: [0,1,2,3]}, 3)] },

    straight_flush_any: { desc: "<b>Four</b> cards in numerical <b>order</b> <em>and</em> of the <b>same suit</b>.", score: 7, drawDetails: [new DrawGroup().addCardsNumeric(4, { suit: -1 })] },
    straight_flush_any_adjacent: { desc: "<b>Three</b> cards in numerical <b>order</b> <em>and</em> of the <b>same suit</b>, which are <b>adjacent</b>.", score: 9, drawDetails: [new DrawGroup().addCardsNumeric(3, { suit: -1 }).setAdjacent(true)] },
    straight_flush: { desc: "<b>Four</b> cards in numerical <b>order</b> <em>and</em> of <b>suit %suit%</b>.", score: 9, drawDetails: [new DrawGroup().addCardsNumeric(4, { suit: 0 })] },
    royal_flush: { desc: "<b>Three</b> cards in numerical <b>order</b> <em>and</em> of the <b>same suit</b>, ending in the highest possible number.", score: 8, drawDetails: [new DrawGroup().addCardsNumeric(3, { suit: -1 }, { number: 10, numberAbsolute: true })] }, // @IMPROV: dynamically select highest number, in case I change that again?

    row_suit_any: { desc: "<b>Three</b> cards of the <b>same suit</b> are in the <em>same row</em>.", score: 2, drawDetails: [new DrawGroup().addCard({ suit: -1 }, 3).setRow(true) ] },
    row_number_any: { desc: "<b>Three</b> cards with the <b>same number</b> are in the <em>same row</em>.", score: 9, drawDetails: [new DrawGroup().addCard({ number: -1 }, 3).setRow(true)] },
    row_suit: { desc: "<b>Three</b> cards of <b>suit %suit%</b> are in the <em>same row</em>.", score: 7, drawDetails: [new DrawGroup().addCard({ suit: 0 }, 3).setRow(true)] },
    row_number: { desc: "<b>Two %number%s</b> are in the <em>same row</em>.", score: 7, drawDetails: [new DrawGroup().addCard({ number: 0}, 2).setRow(true)] },

    variety_suit_row_lack: { desc: "<em>One row</em> contains only <b>one unique suit</b>.", score: 2, drawDetails: [new DrawGroup().addCard({ suit: -1 }, 2).setRow(true).setUndefinedLength(true)] },
    variety_number_row_lack: { desc: "<em>One row</em> contains only <b>one unique number</b>.", score: 4, drawDetails: [new DrawGroup().addCard({ number: -1 }, 2).setRow(true).setUndefinedLength(true)] },
    variety_both_row_lack: { desc: "<em>One row</em> contains only cards of the <b>same suit</b> <em>and</em> the <b>same number</b>.", score: 5, drawDetails: [new DrawGroup().addCard({ suit: -1, number: -1 }, 2).setRow(true).setUndefinedLength(true)] },

    //
    // straightShake expansion; the more weird/chaotic/hard to understand contracts
    //
    royal_flush_adjacent: { desc: "<b>Three</b> cards in <b>order</b> <em>and</em> of <b>same suit</b>, adjacent, ending in highest number.", score: 9, drawDetails: [new DrawGroup().addCardsNumeric(3, { suit: -1 }, { number: 10, numberAbsolute: true }).setAdjacent(true)], rule: "You must name a <b>second wildcard</b> (suit / number) for this round.", set: "straightShake" },

    one_suit_options_number_double: { desc: "Two cards with <b>suit %suit%</b> and <b>number %number%, %number% or %number%</b>.", score: 6, drawDetails: [new DrawGroup().addCard({ suit: 0, number: [1,2,3] }, 2)], rule: "<b>Study</b> all facedown cards before the round starts. You may swap any of them for a new card (once).", set: "straightShake" },

    discard_type: { desc: "A card of <b>suit %suit%</b> is on top of the <b>discard pile</b>.", score: 4, set: "straightShake", rule: "Discarded this suit? Instantly play another card <b>ignoring placement rules</b>.", drawDetails: [new DrawGroup().addCard({ suit: 0 }).setDiscard(true)] },
    discard_number: { desc: "A card with <b>number %number%</b> is on top of the <b>discard pile</b>.", score: 8, set: "straightShake", rule: "Discarded this number? Instantly play another card <b>ignoring placement rules</b>.", drawDetails: [new DrawGroup().addCard({ number: 0 }).setDiscard(true)] },

    variety_suit: { desc: "<b>All suits</b> in the game appear.", score: 2, frame: 0, rule: "If this round has a <b>wildcard suit</b>, it doesn't apply to you.", set: "straightShake" },
    variety_suit_adjacent: { desc: "<b>All suits</b> in the game appear, <b>adjacent</b> to each other.", score: 5, frame: 1, rule: "You may also place a card if its <b>number</b> is at most <b>1 away</b> from all neighbors.", set: "straightShake" },
    variety_number: { desc: "<b>All numbers</b> in the game appear.", score: 8, frame: 2, rule: "If this round has a <b>wildcard number</b>, it doesn't apply to you.", set: "straightShake" },
    variety_row: { desc: "<em>One row</em> contains <b>all suits</b> in the game.", score: 7, frame: 3, rule: "Whenever a <b>new suit</b> enters the game, trade 1 card with another player.", set: "straightShake" },

    number_restriction: { desc: "<b>No</b> number <b>lower than 3</b> appears.", score: 6, set: "straightShake", frame: 4, rule: "You and 1 other player <b>can't play</b> numbers lower than 3 this round." },
    contracts_success: { desc: "<b>All</b> other players <b>fulfill their contract(s)</b>.", score: 5, set: "straightShake", frame: 5, rule: "You must pick 2 contracts this round (if possible)." },
    contracts_fail: { desc: "At least one other player <b>fails a contract</b>.", score: 4, set: "straightShake", frame: 6, rule: "If the <b>Dealer fails</b> a contract, you also fail all your contracts." },

    variety_number_inverse: { desc: "At most <b>five unique numbers</b> appear.", score: 5, set: "straightShake", frame: 7, rule: "Whenever a <b>new number</b> appears, you may look at another player's hand." },
    variety_suit_inverse: { desc: "At least <b>one suit doesn't appear</b>.", score: 7, set: "straightShake", frame: 8, rule: "As soon as all suits <b>do</b> appear, the <b>wildcard</b> of this round disappears." },

    discard_count_free: { desc: "At least <b>one card</b> has been <b>discarded</b>.", score: 2, set: "straightShake", frame: 9, rule: "When the final facedown card is revealed, <b>nobody may play</b> that number anymore." },
    discard_count_strict: { desc: "Exactly <b>two cards</b> have been <b>discarded</b>.", score: 6, set: "straightShake", frame: 10, rule: "You may play cards <b>on top</b> of other cards." },
    discard_dealer: { desc: "The <b>Dealer</b> has <b>discarded</b> at least one card.", score: 3, set: "straightShake", frame: 11, rule: "Whenever the <b>Dealer discards</b>, all players receive an <b>extra card</b>." },

    contract_success_dealer: { desc: "The <b>Dealer fulfills</b> all their <b>contracts</b>. (Dealer can't pick this.)", score: 4, set: "straightShake", rule: "Whoever picked the <b>highest scoring contract</b> determines wildcard this round.", frame: 12 },
    variety_number_inverse_row: { desc: "<em>One row</b> contains at least <b>4 unique numbers</b>.", score: 5, set: "straightShake", rule: "Whoever picked the <b>lowest scoring contract</b>, discards 1 card.", frame: 13 },

    discard_complete_fail: { desc: "One player has <b>not played any card</b> this round.", score: 8, set: "straightShake", frame: 14, rule: "<b>Nobody may play</b> the suit or number of the first revealed (facedown) card." },
    contract_switch: { desc: "One player has <b>switched contract</b> this round.", score: 5, set: "straightShake", frame: 15, rule: "You're <b>not allowed</b> to switch contracts." }
}

export const DYNAMIC_OPTIONS =
{
    "%number%": [], // filled in dynamically from config, as not necessarily all options are in the generated game
    "%suit%": [],
    "%suitImageStrings%": [],
    "%numbermid%": [],
    "%numberlow%": [],
    "%numberhigh%": []
}

/*
@IDEA: ACTION/RULE TWIST: "The player who has the HIGHEST scoring contract may pick the wildcard this round (after selecting contracts)."
*/


export const SPECIAL_CARDS:Record<string,ContractData> = 
{
    switch_contract: { frame: 0, label: "Switch", desc: "<b>Switch</b> your contract with another player." },
    ditch_contract: { frame: 1, label: "No Contract", desc: "<b>Discard</b> your contract." },
    ditch_contract_other: { frame: 2, label: "No Contract", desc: "<b>Force</b> another player to <b>discard</b> their contract." },
    study_hidden: { frame: 3, label: "See Hidden", desc: "<b>Study</b> the facedown cards." },
    study_hand: { frame: 4, label: "See Hand", desc: "<b>Study</b> another player's hand." },
    draw_card: { frame: 5, label: "Draw Card", desc: "<b>Draw</b> an extra card into your hand." },
    draw_card_all: { frame: 6, label: "Draw All", desc: "<b>All players draw</b> an extra card." },
    steal_card: { frame: 7, label: "Steal", desc: "<b>Steal</b> 1 card from another player." },
    play_another_free: { frame: 8, label: "Play Free", desc: "Play another card, <b>ignoring</b> the placement rules." },
    play_another_top: { frame: 9, label: "Play Over", desc: "Play another card <b>on top of</b> an existing card." },
    wildcard_suit: { frame: 10, label: "Wild Suit", desc: "Pick a suit. It's the <b>new wildcard</b>: it can represent any suit you want." },
    wildcard_number: { frame: 11, label: "Wild Number", desc: "Pick a number. It's the <b>new wildcard</b>: it can represent any number you want." },
}