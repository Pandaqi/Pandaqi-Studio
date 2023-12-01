enum CardType
{
    BLACK = "black",
    BLUE = "blue",
    RED = "red",
    YELLOW = "yellow",
    ORANGE = "orange",
    GREEN = "green",
    PINK = "pink",
    PURPLE = "purple",
    TURQUOISE = "turquoise",
    WHITE = "white",
    BROWN = "brown"
}

interface PackData
{
    frame: number,
    type: string,
    actions: string[],
    numbers?: Record<number, number>,
    actionPercentages?: Record<number, number>,
}

// @TODO: give each one 2 actions, and the black one a lot more?
const PACKS:Record<CardType, PackData> =
{
    [CardType.BLACK]: { frame: 0, type: "Multi-Break Shell", actions: ["score_color", "score_diversity", "wildcard_up", "wildcard_down", "cleanup", "strong_force", "strong_destroy", "risky_rocket", "pity_purchase", "explosion_self", "explosion_neighbor", "steal", "safety_suit", "same_color_bonus"], numbers: { 2: 10, 4: 10 }, actionPercentages: { 2: 1.0, 4: 1.0 } },
    [CardType.RED]: { frame: 1, type: "Firecracker", actions: ["remove", "remove_other"] },
    [CardType.ORANGE]: { frame: 2, type: "Cake", actions: ["force", "skip"] },
    [CardType.YELLOW]: { frame: 3, type: "Sparkler", actions: ["more_coins", "fewer_coins"] },
    [CardType.GREEN]: { frame: 4, type: "Ground Flower", actions: ["more_score", "less_score"] },
    [CardType.TURQUOISE]: { frame: 5, type: "Flare", actions: ["explosion_delayed", "explosion_buddy"] },
    [CardType.BLUE]: { frame: 6, type: "Fountain", actions: ["return_discard", "return_revealed"] },
    [CardType.PURPLE]: { frame: 7, type: "Bottle Rocket", actions: ["lower_threshold", "raise_threshold"] },
    [CardType.PINK]: { frame: 8, type: "Parachute", actions: ["draw_safe", "draw_risky"] },
    [CardType.WHITE]: { frame: 9, type: "Snappers", actions: ["change_color", "change_num"] },
    [CardType.BROWN]: { frame: 10, type: "Smoke Bomb", actions: ["super_cracker", "hide_card"] },
}

interface ActionData
{
    desc: string,
    label?: string,
    cost?: number
}

const ACTIONS:Record<string,ActionData> =
{
    // those related to a specific set, in sensible pairs
    remove: { desc: "Destroy a card from your discard pile." },
    remove_other: { desc: "Destroy a revealed card from another player." },

    force: { desc: "Force the next player to <b>reveal</b>." },
    skip: { desc: "Force yourself or your neighbor to <b>skip</b> their next turn." },

    more_coins: { desc: "Worth <b>2 coins</b> when buying." }, // @TODO: use coin icon instead?
    fewer_coins: { desc: "Worth <b>0 coins</b> when buying.", cost: 0 },

    more_score: { desc: "Worth <b>-2 coins</b> when buying, but scores <b>double</b> its number." }, // @TODO: use coin icon instead?
    less_score: { desc: "Worth <b>3 coins</b> when buying, but scores <b>-1 points</b>." },

    explosion_delayed: { desc: "The first time you explode, you stay alive, but must reveal another card." },
    explosion_buddy: { desc: "If you explode, so does every neighbor who hasn't already stopped.", cost: 2 },

    return_discard: { desc: "Move 2 cards from your discard back to your deck, then shuffle." },
    return_revealed: { desc: "Move 2 revealed cards back into your deck, then shuffle." },

    lower_threshold: { desc: "Pick a color. Its threshold for exploding is lowered by 3." },
    raise_threshold: { desc: "Pick a color. Its threshold for exploding is raised by 3." },

    last_alive: { label: "Stick it out", desc: "If you're the last player alive, you get <b>any card</b> from the shop (for free)." },
    first_stop: { label: "Sudden Burst", desc: "If you're the first to stop, reveal 3 more cards without exploding.", cost: 2 },

    draw_safe: { label: "Safety Goggles", desc: "Once this round, you may look at your card before revealing, and decide to <b>stop</b> instead." },
    draw_risky: { label: "No Hesitation", desc: "Once this round, you may reveal 3 cards at once." },

    change_color: { label: "Colorshift", desc: "Tuck this card underneath another: it becomes the same color." },
    change_number: { label: "Numbershift", desc: "Tuck this card underneath another: it becomes the same number." },

    super_cracker: { label: "Super Cracker", desc: "You explode. This card is worth 10 points." },
    hide_card: { label: "Blind Eye", desc: "Turn any revealed card facedown." },

    // all the black card powers
    score_color: { label: "Double Sight", desc: "Scores the number of Black cards that you have." },
    score_diversity: { label: "Multicolor", desc: "Scores the number of unique actions that your deck contains." },
    wildcard_up: { label: "Wildcard Up", desc: "Increases the total of <b>all colors</b> by 3." },
    wildcard_down: { label: "Wildcard Down", desc: "Decreases the total of <b>all colors</b> by 3." },
    cleanup: { label: "Cleanup", desc: "Move all revealed cards from any player to their discard pile." },
    strong_force: { label: "Strong Force", desc: "Force any player to <b>reveal</b> or </stop> on their next turn." },
    strong_destroy: { label: "Strong Destroy", desc: "Destroy any card from yourself (deck, discard or revealed), then shuffle." },
    risky_rocket: { label: "Risky Rocket", desc: "From now on, if anyone <b>reveals</b>, they must reveal 2 cards at once." },
    pity_purchase: { label: "Pity Purchase", desc: "If you explode, immediately discard all your revealed cards. You may still buy something for 1 coin." },
    explosion_self: { label: "Own Fault", desc: "Anyone who reveals a color they've already revealed, instantly explodes." },
    explosion_neighbor: { label: "Reckless Neighbor", desc: "Anyone who reveals the same number as the previous player, instantly explodes." },
    steal: { label: "Boom Burglar", desc: "Steal 1 revealed card from another player. Place it on your own discard." },
    safety_suit: { label: "Safety Suit", desc: "You can't explode for 2 turns. But you can only spend <b>half</b> your coins (rounded down)." },
    same_color_bonus: { label: "Style Points", desc: "If all your revealed cards have the same color or number, you can spend <b>double</b> your coins."  }
}


const MISC =
{
}

export 
{
    CardType,
    MISC,
    PACKS,
    ACTIONS
}
