export enum ActionType
{
    STOPPED = "stopped",
    PASSED = "passed",
    UNSEEN = "unseen"
}

export interface GeneralData
{
    frame?: number,
    desc?: string,
    type?: ActionType, // ActionType.STOPPED by default
    sets?: string[], // ["base"] by default
    prob?: number // 1 by default
    canCombine?: boolean // if true, this can be picked by an UNSEEN action to combine with => mostly added to short and punchy base actions
    shield?: boolean, // if true, this is a shield card, which means we add an automatic icon and "rotate sideways to remember"
}

export const NUMBERS_WRITTEN = 
[
    "Minus One", "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"
]

export const ACTION_PREFIXES:Record<ActionType, string> = 
{
    [ActionType.STOPPED]: "<col hex=\"#ff4645\">Stopped?</col>",
    [ActionType.PASSED]: "<col hex=\"#955a16\">Passed?</col>",
    [ActionType.UNSEEN]: "<col hex=\"#6b2eae\">Unseen?</col>"
}

export const ACTION_REPLACEMENTS:Record<string,any> =
{
    "%change%": ["add", "subtract"],
    "%compare%": ["less than", "more than"],
    "%numtiny%": [1,2],
    "%numlow%": [1,2,3,4],
    "%nummid%": [2,3,4,5],
    "%numhigh%": [3,4,5,6],
    "%side%": ["left", "right"],
    "%sign%": ["+1", "-1"],
}

export const ACTIONS:Record<string,GeneralData> =
{
    // BASE GAME
    subtract: { frame: 0, desc: "<b>Subtract %numlow%</b> from the result.", prob: 3, sets: ["base"], canCombine: true },
    add: { frame: 1, desc: "<b>Add %numlow%</b> to the result.", prob: 3, sets: ["base"], canCombine: true },
    invert_low: { frame: 2, desc: "If your result is <b>lower than %nummid%</b>, it's 6 instead.", prob: 2, sets: ["base"], canCombine: true }, // => These are very necessary _inverters_ without saying the word.
    invert_high: { frame: 3, desc: "If your result is <b>higher than %nummid%</b>, it's 1 instead.", prob: 2, sets: ["base"], canCombine: true },
    cant_attack_cond: { frame: 4, desc: "You <b>can't attack</b> anyone with <b>%compare% %nummid%</b> health.", sets: ["base"] },
    cant_attack_seat: { frame: 5, desc: "You <b>can't attack</b> your %side% neighbor.", sets: ["base"] },
    double_curse: { frame: 6, desc: "<b>Double</b> your result, then <b>discard</b> 1 card from your row.", prob: 1.5, sets: ["base"] },
    double_cond: { frame: 7, desc: "If your result is <b>lower than %nummid%</b>, <b>double</b> it.", sets: ["base"], canCombine: true },
    swap_hand: { frame: 8, desc: "<b>Swap</b> one hand card for one from the deck.", sets: ["base"], canCombine: true },
    swap_row: { frame: 9, desc: "<b>Swap</b> two cards in your row.", sets: ["base"], canCombine: true },
    draw: { frame: 10, desc: "You <b>don't attack</b>, but <b>draw</b> an extra card into your hand.", prob: 1.5, sets: ["base"] },
    shuffle: { frame: 11, desc: "Blindly <b>shuffle</b> the entire row of any player.", sets: ["base"], canCombine: true },
    attack_double: { frame: 12, desc: "You may <b>attack 2</b> different players.", sets: ["base"] },
    reroll_stop: { frame: 13, desc: "<b>Roll again</b>. Its result, without effect applied, is your final attack.", sets: ["base"] },
    health_compare: { frame: 14, desc: "If your result is <b>%compare% your total health</b>, %change% %numlow% to it.", sets: ["base"] },
    health_equal: { frame: 15, desc: "If your result is <b>equal</b> to <b>this card's health</b>, you must stop here.", sets: ["base"] },
    no_action: { frame: 16, desc: "No special action.", sets: ["base"], prob: 3 },

    // SUPERPOWERS
    no_add: { frame: 17, desc: "Your roll <b>isn't added</b> to your row, but returns to your hand. <b>Discard</b> this card.", type: ActionType.STOPPED, sets: ["superPowers"] },
    remove_any: { frame: 18, desc: "<b>Don't attack.</b> Instead, remove 1 card with <b>more health</b> than your result from any row.", type: ActionType.STOPPED, sets: ["superPowers"] },
    receive_damaged: { frame: 19, desc: "1 card you removed from another player (by attacking) is <b>added to your row</b> instead.", type: ActionType.STOPPED, sets: ["superPowers"] },
    shield_specific: { frame: 20, desc: "This card <b>can't be lost</b> until your next turn.", type: ActionType.PASSED, sets: ["superPowers"], shield: true, prob: 2, canCombine: true },
    shield_row: { frame: 21, desc: "Your row <b>can't get smaller than 2 cards</b> until your next turn.", type: ActionType.STOPPED, sets: ["superPowers"], shield: true, prob: 1.5 },
    shield_number: { frame: 22, desc: "<b>Nobody can attack</b> you with a result <b>%compare% %nummid%</b> until your next turn.", type: ActionType.STOPPED, sets: ["superPowers"], shield: true, prob: 2 },
    shield_weak: { frame: 23, desc: "Until your next turn, all cards after this one have <b>%sign% health</b>.", type: ActionType.PASSED, sets: ["superPowers"], shield: true },
    shield_pierce: { frame: 24, desc: "Your attack <b>ignores shields</b>. But until your next turn, your <b>own shields are ignored</b> too.", type: ActionType.PASSED, sets: ["superPowers"], shield: true },
    rerolls_max: { frame: 25, desc: "You may only do <b>%numtiny% more rerolls</b> (at most).", type: ActionType.PASSED, sets: ["superPowers"], canCombine: true },
    rerolls_specific: { frame: 26, desc: "You must do <b>%numtiny% more rerolls</b>. (If out of cards, keep rerolling for the final card.)", type: ActionType.PASSED, sets: ["superPowers"] },
    forced_add: { frame: 27, desc: "You must <b>add</b> your card to the <b>%side%</b> of the row.", type: ActionType.STOPPED, sets: ["superPowers"] },
    shrink_die: { frame: 28, desc: "<b>Take %numtiny% card(s) out</b> of your die (for this turn).", type: ActionType.PASSED, sets: ["superPowers"], prob: 2, canCombine: true },
    perma_add: { frame: 29, desc: "<b>Add %numlow%</b> to the result (permanently).", type: ActionType.PASSED, sets: ["superPowers"], canCombine: true },
    perma_subtract: { frame: 30, desc: "<b>Subtract %numlow%</b> from the result (permanently).", type: ActionType.PASSED, sets: ["superPowers"], canCombine: true },
    unseen_discard: { frame: 31, desc: "<b>Discard</b> 1 card from your row or hand.", type: ActionType.UNSEEN, sets: ["superPowers"] },
    unseen_draw: { frame: 32, desc: "If you hold fewer than 4 cards, <b>draw</b> a card into your hand.", type: ActionType.UNSEEN, sets: ["superPowers"] },
    unseen_study: { frame: 33, desc: "<b>Look at</b> another player's hand cards.", type: ActionType.UNSEEN, sets: ["superPowers"] },
    unseen_swap: { frame: 34, desc: "<b>Swap</b> 1 row card of yours with 1 row card of another.", type: ActionType.UNSEEN, sets: ["superPowers"] },
    unseen_row_add: { frame: 35, desc: "<b>Roll again</b>. Add that result to your row <b>instead</b> of your original roll.", type: ActionType.UNSEEN, sets: ["superPowers"] },
    unseen_curse: { frame: 36, desc: "Take 1 damage to <b>yourself</b>.", type: ActionType.UNSEEN, sets: ["superPowers"] },
    // DEPRECATED => takes too many words to explain, and unseen actions should be very short => unseen_deckbreak: { frame: 37, desc: "Next turn, you may roll using only a part of your deck. (Rotate this card sideways to remember.)", type: ActionType.UNSEEN, sets: ["superPowers"] },
    
}

export const MISC:Record<string, GeneralData> =
{
    number_box: { frame: 0 },
    health_box: { frame: 1 },
    power_box: { frame: 2 },
    stripes: { frame: 3 },
    shield_icon: { frame: 4 },
    unseen_icon: { frame: 5 },
    arrow: { frame: 6 }
}