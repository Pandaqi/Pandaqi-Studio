
enum Type
{
    LIFE = "LIFE",
    NUMBER = "NUMBER"
}

enum PClass
{
    LOW = "low",
    MED = "medium",
    HIGH = "high"
}

interface PowerData
{
    class?: PClass,
    lives?: number[],
    desc?: string,
    needsNegative?: boolean,
    dynamic?: boolean
}

type PowerSet = Record<string, PowerData>;

const POWERS:PowerSet = 
{
    // generally HIGH powers
    no_match: { desc: "You're not allowed to match suit with a neighbor card.", class: PClass.HIGH },
    even: { desc: "You can only play EVEN numbers.", class: PClass.HIGH },
    odd: { desc: "You may only play ODD numbers.", class: PClass.HIGH },
    weak_match: { desc: "Only draw ONE card when matching suits with a neighbor.", class: PClass.HIGH },
    must_match: { desc: "You must match suit with the first card played.", class: PClass.HIGH },
    show_hand: { desc: "Round Start: show your hand to everyone.", class: PClass.HIGH },
    cant_wager: { desc: "You can't wager.", class: PClass.HIGH },
    must_wager_first: { desc: "You must wager on your first turn.", class: PClass.HIGH },
    inverse_turn: { desc: "You MUST play a number that's already been played.", class: PClass.HIGH },
    forced_left: { desc: "You must play cards to the LEFT.", class: PClass.HIGH },
    forced_right: { desc: "You must play cards to the RIGHT.", class: PClass.HIGH },
    no_unique_suits: { desc: "You can't play a suit if you only have it once.", class: PClass.HIGH },
    no_extreme_numbers: { desc: "You can't play your lowest or highest number.", class: PClass.HIGH },
    no_multiple_suits: { desc: "You can't play a suit of which you have multiple.", class: PClass.HIGH },
    no_multiple_number: { desc: "You can't play a number of which you have multiple.", class: PClass.HIGH },
    no_majority_suit: { desc: "You can't play the suit you have the most.", class: PClass.HIGH },
    no_minority_suit: { desc: "You can't play the suit you have the least.", class: PClass.HIGH },
    kittyking_loss: { desc: "For each life the Kittyking loses, you lose one too.", class: PClass.HIGH },
    fixed_hand_right: { desc: "You can't change hand order. Always play the card furthest RIGHT.", class: PClass.HIGH },
    fixed_hand_left: { desc: "You can't change hand order. Always play the card furthest LEFT.", class: PClass.HIGH },
    wager_follow: { desc: "If the previous player wagered, you must do so too.", class: PClass.HIGH },
    wager_double: { desc: "If you wager, you pay 2 lives (instead of 1).", class: PClass.HIGH },

    // generally MEDIUM powers
    value_above_lives: { desc: "You can't play a number lower than your Life", class: PClass.MED },
    value_below_lives: { desc: "You can't play a number higher than your Life", class: PClass.MED },
    must_stack: { desc: "Your stacks must have at least 3 cards.", class: PClass.MED },
    must_subtract: { desc: "When playing a stack, you may only SUBTRACT.", class: PClass.MED, needsNegative: true },
    must_add: { desc: "When playing a stack, you may only ADD.", class: PClass.MED, needsNegative: true },
    double_loss: { desc: "If you can't play a card, you lose 2 lives (instead of 1).", class: PClass.MED },
    neighbor_left_loss: { desc: "If your left neighbor loses the round, you also lose a life.", class: PClass.MED },
    neighbor_right_loss: { desc: "If your right neighbor loses the round, you also lose a life.", class: PClass.MED },
    hand_size_small_skip: { desc: "If you have the least cards, skip your turn.", class: PClass.MED },
    hand_size_large_skip: { desc: "If you have the most cards, skip your turn.", class: PClass.MED },
    give_away: { desc: "After each turn, give away one card.", class: PClass.MED },
    ignore_number_specific: { desc: "Ignore all cards with %number% (when checking for duplicates).", class: PClass.MED, dynamic: true },
    see_hand: { desc: "Round Start: look at another player's hand.", class: PClass.MED },
    shuffle_lives: { desc: "Round Start: study your next 3 Life Cards. Pick which one you want on top.", class: PClass.MED },
    forbidden_suit: { desc: "You can't play %suit%", class: PClass.MED, dynamic: true },
    forbidden_number: { desc: "You can't play %number% (single card or total value)", class: PClass.MED, dynamic: true },
    unique_suits: { desc: "You can play each suit only ONCE per round.", class: PClass.MED },
    no_match_draw: { desc: "You only draw 2 cards if you DON'T match a neighbor suit", class: PClass.MED },
    double_turn: { desc: "You may take 2 turns in a row.", class: PClass.MED },
    double_turn_variant: { desc: "You must take 2 turns in a row, but may play duplicate numbers.", class: PClass.MED },
    higher_than_nbs: { desc: "Your number must be HIGHER than its neighbor(s).", class: PClass.MED },
    lower_than_nbs: { desc: "Your number must be LOWER than its neighbor(s).", class: PClass.MED },
    suit_shapeshift: { desc: "Only for you, cards with %suit% become %suit%", class: PClass.MED, dynamic: true },
    number_shapeshift: { desc: "Only for you, cards below %number% become %number%", class: PClass.MED, dynamic: true },
    super_wager: { desc: "You draw 2 cards for wagering.", class: PClass.MED },

    // generally LOW powers
    ignore_numbers_left: { desc: "Ignore all numbers to the LEFT of the starting card.", class: PClass.LOW },
    ignore_numbers_right: { desc: "Ignore all numbers to the RIGHT of the starting card.", class: PClass.LOW },
    ignore_suit_specific: { desc: "Ignore all cards with %number% (when checking for duplicates).", class: PClass.LOW, dynamic: true },
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
    generous_draw: { desc: "Round Over: draw as many cards as you played.", lives: [2,3] },
    life_means_card: { desc: "Round Over: take 2 cards (played this round) into your hand.", lives: [2,3] },
    swap_lives: { desc: "Round Over: Swap 2 Life Cards between different players.", lives: [2,3] },
    replace_play: { desc: "The card(s) you play may REPLACE existing cards on the table.", class: PClass.LOW },
    single_turn: { desc: "If you're Kittyking, you only have to take 1 turn per round.", lives: [2,3] },

    // "everybody else" powers seems most useful here?
    others_follow: { desc: "Everybody else must play the same suit as the first card", class: PClass.LOW }, 
    others_cant_stack: { desc: "Everybody else is not allowed to play stacks.", lives: [1] },
    others_cant_wager: { desc: "Nobody else may wager until you've done so.", lives: [1] },
    others_low_limit: { desc: "Everybody else has a hand limit of 3.", class: PClass.LOW },
    others_no_suit: { desc: "Nobody else may play %suit%", class: PClass.LOW, dynamic: true },
    others_no_number: { desc: "Nobody else may play %number% (single card or total value)", class: PClass.LOW, dynamic: true },
}

const SUITS = 
{
    circle: { frame: 0, color: "#1B7900", cardsPerNumber: 3, numbers: [1,4,7] }, // the frame after (0 + 1) is always the simplified version of the suit symbol
    square: { frame: 2, color: "#1E41AA", cardsPerNumber: 3, numbers: [2,5,8] },
    triangle: { frame: 4, color: "#AA1E2B", cardsPerNumber: 3, numbers: [3,6,9] },
    star: { frame: 6, color: "#212121", cardsPerNumber: 1, numbers: [1,2,3,4,5,6,7,8,9] },
}

const CATS =
{
    siamese: { frame: 0, label: "Siamese Swordfighter", color: "#454545" },
    munchkin: { frame: 1, label: "Munching Munchkin", color: "#AD5810" },
    persian: { frame: 2, label: "Persian Peddler", color: "#227F8F" },
    curl: { frame: 3, label: "Climbing Curl", color: "#CF236A" },
    ragdoll: { frame: 4, label: "Ragdoll Rocketeer", color: "#790067" },
    himalayan: { frame: 5, label: "Himalayan Hunter", color: "#7F9821" }
}

const MISC =
{
    heart: { frame: 0 },
    bg_cat: { frame: 1 },
    hand: { frame: 2 },
    rulesReminder: { frame: 3 }
}

export 
{
    Type,
    PClass,
    PowerData,
    SUITS,
    CATS,
    POWERS,
    MISC
}
