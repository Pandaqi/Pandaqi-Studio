
export enum Type
{
    LIFE = "LIFE",
    NUMBER = "NUMBER"
}

export enum PClass
{
    LOW = "low",
    MED = "medium",
    HIGH = "high"
}

export interface PowerData
{
    class?: PClass,
    lives?: number[],
    desc?: string,
    needsNegative?: boolean,
    dynamic?: boolean,
    dynamicOptions?: any[]
}

type PowerSet = Record<string, PowerData>;

// @NOTE: There is only one "Round Start" power, because if there'd be multiple then we get an issue with _order_.
// @NOTE: Otherwise, powers can be "Round Start/Over" or "Turn Start/Over"
export const POWERS:PowerSet = 
{
    // generally HIGH powers
    no_match: { desc: "You're not allowed to match suit with a neighbor card.", class: PClass.HIGH },
    even: { desc: "You can only play EVEN numbers.", class: PClass.HIGH },
    odd: { desc: "You may only play ODD numbers.", class: PClass.HIGH },
    weak_match: { desc: "Only draw ONE card when matching suits with a neighbor.", class: PClass.HIGH },
    must_match: { desc: "You must match suit with the first card played.", class: PClass.HIGH },
    show_hand: { desc: "You must play with your hand open.", class: PClass.HIGH },
    cant_wager: { desc: "You can't wager.", class: PClass.HIGH },
    must_wager_first: { desc: "You must wager on your first turn.", class: PClass.HIGH },
    must_wager_all: { desc: "You must wager every turn.", lives: [8] },
    inverse_turn: { desc: "You MUST play a number that's already been played.", class: PClass.HIGH },
    forced_side: { desc: "You must play cards to the %side%.", class: PClass.HIGH, dynamic: true },
    no_unique_suits: { desc: "You can't play a suit if you only have it once.", class: PClass.HIGH },
    no_extreme_numbers: { desc: "You can't play your lowest or highest number.", class: PClass.HIGH },
    no_multiple_suits: { desc: "You can't play a suit of which you have multiple.", class: PClass.HIGH },
    no_multiple_number: { desc: "You can't play a number of which you have multiple.", class: PClass.HIGH },
    no_majority_suit: { desc: "You can't play the suit you have the most.", class: PClass.HIGH },
    no_minority_suit: { desc: "You can't play the suit you have the least.", class: PClass.HIGH },
    kittyking_loss: { desc: "For each life the Kittyking loses, you lose one too.", class: PClass.HIGH },
    fixed_hand_side: { desc: "You can't change hand order. Always play the card furthest %side%.", class: PClass.HIGH, dynamic: true },
    wager_follow: { desc: "If the previous player wagered, you must do so too.", class: PClass.HIGH },
    wager_double: { desc: "If you wager, you pay 2 lives (instead of 1).", class: PClass.HIGH },
    hand_empty_loss: { desc: "If you run out of cards, everyone loses the round.", class: PClass.HIGH },
    suit_play_limit: { desc: "Each suit may only be played TWICE.", class: PClass.HIGH },
    must_play_lives: { desc: "You can only play numbers currently on Life Cards.", class: PClass.HIGH },

    // generally MEDIUM powers
    value_above_lives: { desc: "You can't play a number lower than your Life", class: PClass.MED },
    value_below_lives: { desc: "You can't play a number higher than your Life", class: PClass.MED },
    must_stack: { desc: "Your stacks must have at least 3 cards.", class: PClass.MED },
    must_subtract: { desc: "When playing a stack, you may only SUBTRACT.", class: PClass.MED, needsNegative: true },
    must_add: { desc: "When playing a stack, you may only ADD.", class: PClass.MED, needsNegative: true },
    double_loss: { desc: "If you can't play a card, you lose 2 lives (instead of 1).", class: PClass.MED },
    neighbor_side_loss: { desc: "If your %side% neighbor loses the round, you also lose a life.", class: PClass.MED, dynamic: true },
    hand_size_small_skip: { desc: "If you have the least cards, skip your turn.", class: PClass.MED },
    hand_size_large_skip: { desc: "If you have the most cards, skip your turn.", class: PClass.MED },
    give_away: { desc: "Turn Over: give away one card.", lives: [5,6] },
    ignore_number_above: { desc: "Ignore all numbers below %number% (when checking for duplicates).", lives: [4,5], dynamic: true, dynamicOptions: [3,4] },
    ignore_number_below: { desc: "Ignore all numbers above %number% (when checking for duplicates).", lives: [4,5], dynamic: true, dynamicOptions: [6,7] },
    shuffle_lives: { desc: "Round Over: pick which Life Card you want on top.", class: PClass.MED },
    forbidden_suit: { desc: "You can't play %suit%", class: PClass.MED, dynamic: true },
    forbidden_number: { desc: "You can't play %number% (single card or total value)", class: PClass.MED, dynamic: true },
    unique_suits: { desc: "You can play each suit only ONCE per round.", class: PClass.MED },
    no_match_draw: { desc: "You only draw 2 cards if you DON'T match a neighbor suit", class: PClass.MED },
    double_turn: { desc: "You may take 2 turns in a row.", class: PClass.MED },
    double_turn_variant: { desc: "You must take 2 turns in a row, but may play duplicate numbers.", class: PClass.MED },
    higher_than_nbs: { desc: "Your number must be HIGHER than its neighbor(s).", class: PClass.MED },
    lower_than_nbs: { desc: "Your number must be LOWER than its neighbor(s).", class: PClass.MED },
    suit_shapeshift: { desc: "Only for you, cards with %suit% become %suit%", class: PClass.MED, dynamic: true },
    number_shapeshift_above: { desc: "Only for you, all hand cards below %number% become 4", class: PClass.MED, dynamic: true, dynamicOptions: [3,4,5] },
    number_shapeshift_below: { desc: "Only for you, all hand cards above %number% become 6", class: PClass.MED, dynamic: true, dynamicOptions: [5,6,7] },
    super_wager: { desc: "You draw 2 cards for wagering.", class: PClass.MED },
    wager_force: { desc: "If you wager, the next player must do so too.", class: PClass.MED },
    others_no_number: { desc: "Nobody else may play %number% (single card or total value)", lives: [4,5], dynamic: true },
    wager_means_open: { desc: "If you wager, play with your hand open (from now on).", lives: [5,6] },
    draw_from_discard: { desc: "Instead of drawing from the deck, draw from the discard pile.", class: PClass.MED },
    hand_empty_carousel: { desc: "If you run out of cards, all players give their hand to the %side%.", class: PClass.MED, dynamic: true },
    reverse_direction: { desc: "If you wager, reverse playing direction.", class: PClass.MED },
    reverse_direction_match: { desc: "Turn Over: if you drew cards, reverse playing direction.", class: PClass.MED },
    cant_play_lives: { desc: "You can't play any number that's currently on a Life Card.", lives: [5,6] },
    extra_num: { desc: "Round Start: pick any number 1-9. Duplicates are allowed for it.", class: PClass.MED },
    extra_num_outside_range: { desc: "Round Start: pick any number outside 1-9. Stacks may be that number.", class: PClass.MED },

    // generally LOW powers
    ignore_numbers_side: { desc: "Ignore all numbers to the %side% of the starting card.", class: PClass.LOW, dynamic: true },
    ignore_suit_specific: { desc: "Ignore all cards with %suit% (when checking for duplicates).", class: PClass.LOW, dynamic: true },
    swap_hand: { desc: "Round Over: you may swap cards with another player.", lives: [2,3] },
    one_duplicate: { desc: "You may play ONE duplicate number per round.", class: PClass.LOW },
    exceed_above: { desc: "You're allowed to play numbers above 9", lives: [1] },
    exceed_below: { desc: "You're allowed to play numbers below 1", lives: [1] },
    collateral_damage: { desc: "If you lose a life, pick another player who also loses one.", lives: [2,3] },
    kittyking_picker: { desc: "Round Over: YOU decide who's Kittyking.", lives: [2,3] },
    thief: { desc: "Turn Over: steal one card from another player.", lives: [2,3] },
    thief_polite: { desc: "Turn Over: ask another for a specific card. They must give it, if they have it.", lives: [2,3] },
    skip_big_hand: { desc: "If you have the most cards, you may skip your turn.", lives: [2,3] },
    skip_small_hand: { desc: "If you have the least cards, you may skip your turn.", lives: [2,3] },
    only_self_failure: { desc: "You ONLY lose a life if YOU can't play a card.", lives: [1] },
    instant_draw: { desc: "Turn Over: draw back up to your hand limit.", lives: [1] },
    generous_draw: { desc: "Turn Over: draw as many cards as you played (ignoring other rules).", lives: [2,3] },
    life_means_card: { desc: "Round Over: take 2 cards (played this round) into your hand.", lives: [2,3] },
    swap_lives: { desc: "Round Start: swap 2 Life Cards between different players.", lives: [2,3] },
    replace_play: { desc: "The card(s) you play may REPLACE existing cards on the table.", class: PClass.LOW },
    single_turn: { desc: "If you're Kittyking, you only have to take 1 turn per round.", lives: [2,3] },
    gain_life: { desc: "Round Over: if ALL numbers were played, you GAIN a life instead!", class: PClass.LOW },
    draw_cards_played: { desc: "Instead of drawing from the deck, draw from the cards played.", class: PClass.LOW },

    // "everybody else" powers seems most useful here?
    others_follow: { desc: "Everybody else must play the same suit as the first card", class: PClass.LOW }, 
    others_cant_stack: { desc: "Nobody else is allowed to play stacks.", lives: [1] },
    others_cant_wager: { desc: "Nobody else may wager until you've done so.", lives: [1] },
    others_low_limit: { desc: "Everybody else has a hand limit of 3.", class: PClass.LOW },
    others_no_suit: { desc: "Nobody else may play %suit%", class: PClass.LOW, dynamic: true },
    others_play_open: { desc: "Everybody else must play with their hand open.", lives: [2,3] },
    play_in_order: { desc: "Everybody else must play cards in order (ascending or descending).", class: PClass.LOW },
    others_low_draw: { desc: "Everybody else only draws 1 card for matching suits.", lives: [2,3] }
}

export const SUITS = 
{
    circle: { frame: 0, color: "#1B7900", cardsPerNumber: 3, numbers: [1,4,7] }, // the frame after (0 + 1) is always the simplified version of the suit symbol
    square: { frame: 2, color: "#1E41AA", cardsPerNumber: 3, numbers: [2,5,8] },
    triangle: { frame: 4, color: "#AA1E2B", cardsPerNumber: 3, numbers: [3,6,9] },
    star: { frame: 6, color: "#212121", cardsPerNumber: 1, numbers: [1,2,3,4,5,6,7,8,9] },
}

export const CATS =
{
    siamese: { frame: 0, label: "Siamese Swordfighter", color: "#454545" },
    munchkin: { frame: 1, label: "Munching Munchkin", color: "#AD5810" },
    persian: { frame: 2, label: "Persian Peddler", color: "#227F8F" },
    curl: { frame: 3, label: "Climbing Curl", color: "#CF236A" },
    ragdoll: { frame: 4, label: "Ragdoll Rocketeer", color: "#790067" },
    himalayan: { frame: 5, label: "Himalayan Hunter", color: "#7F9821" }
}

export const MISC =
{
    heart: { frame: 0 },
    bg_cat: { frame: 1 },
    hand: { frame: 2 },
    rulesReminder: { frame: 3 }
}