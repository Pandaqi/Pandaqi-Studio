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
    colorLight?: string,
    colorDark?: string,
    colorMid?: string,
}

const PACKS:Record<CardType, PackData> =
{
    [CardType.BLACK]: { frame: 0, type: "Multi-Break Shell", actions: ["score_color", "score_diversity", "wildcard_up", "wildcard_down", "cleanup", "strong_force", "strong_destroy", "risky_rocket", "pity_purchase", "explosion_self", "explosion_neighbor", "steal", "safety_suit", "same_color_bonus", "more_score", "less_score"], numbers: { 2: 10, 4: 10 }, actionPercentages: { 2: 1.0, 4: 1.0 }, colorDark: "#0F0F0F", colorMid: "#A9A9A9", colorLight: "#E2E2E2" },
    [CardType.RED]: { frame: 1, type: "Firecracker", actions: ["remove", "remove_other"], colorDark: "#2A0300", colorMid: "#EE9092", colorLight: "#FFE4E7" },
    [CardType.ORANGE]: { frame: 2, type: "Cake", actions: ["force", "skip"], colorDark: "#2A1300", colorMid: "#E09C5B", colorLight: "#F4EFAF" }, // also "Barrage"
    [CardType.YELLOW]: { frame: 3, type: "Sparkler", actions: ["more_coins", "fewer_coins"], colorDark: "#211D00", colorMid: "#CAC17C", colorLight: "#FFF8EF" },
    [CardType.GREEN]: { frame: 4, type: "Ground Flower", actions: ["last_alive", "first_stop"], colorDark: "#042400", colorMid: "#8CCC84", colorLight: "#FFFFFB" }, // also "Ground Spinner" or "Ground Blooming Flower"
    [CardType.TURQUOISE]: { frame: 5, type: "Flare", actions: ["explosion_delayed", "explosion_buddy"], colorDark: "#00211C", colorMid: "#8ACCC0", colorLight: "#EFFFF6" },
    [CardType.BLUE]: { frame: 6, type: "Fountain", actions: ["return_discard", "return_revealed"], colorDark: "#000E24", colorMid: "#AEC7ED", colorLight: "#FFFCFF" }, // also close to "Roman Candle"
    [CardType.PURPLE]: { frame: 7, type: "Bottle Rocket", actions: ["lower_threshold", "raise_threshold"], colorDark: "#210228", colorMid: "#D4AADD", colorLight: "#FAFFFF" },
    [CardType.PINK]: { frame: 8, type: "Parachute", actions: ["draw_safe", "draw_risky"], colorDark: "#35001B", colorMid: "#DD93B9", colorLight: "#FFE8EE" },
    [CardType.WHITE]: { frame: 9, type: "Snappers", actions: ["change_color", "change_number"], colorDark: "#FBFBFB", colorMid: "#5D5D5D", colorLight: "#191919" }, // also "Bang Snaps" or "Fun Snaps"; colors INVERTED (otherwise it'd just be the black cards)
    [CardType.BROWN]: { frame: 10, type: "Smoke Bomb", actions: ["super_cracker", "hide_card"], colorDark: "#250B00", colorMid: "#CA9076", colorLight: "#FFE4CB" },
}

interface ActionData
{
    desc: string,
    label?: string,
    cost?: number
}

const cIcon = '<img id="misc" frame="0">'; // coin icon

const ACTIONS:Record<string,ActionData> =
{
    // those related to a specific set, in sensible pairs
    remove: { label: "Destroy Discard", desc: "You may <b>destroy</b> a card from your discard pile or deck (then shuffle)." },
    remove_other: { label: "Destroy Others", desc: "You may <b>destroy</b> any revealed card." },

    force: { label: "Force Reveal", desc: "Force the next player to <b>reveal</b>." },
    skip: { label: "Force skip", desc: "Force yourself or your neighbor to <b>skip</b> their next turn." },

    more_coins: { label: "Treasure", desc: "Worth <b>2 " + cIcon + "</b> when buying." },
    fewer_coins: { label: "Garbage Product", desc: "Worth <b>0 " + cIcon + "</b> when buying.", cost: -1 },

    more_score: { label: "Points Trade", desc: "Worth <b>-1 " + cIcon + "</b> when buying, but scores <b>double</b> its number." },
    less_score: { label: "Money Trade", desc: "Worth <b>3 " + cIcon + "</b> when buying, but scores <b>-2 points</b>." },

    explosion_delayed: { label: "Stayin' Alive", desc: "The first time you explode, you <b>stay alive</b>, but must reveal another card." },
    explosion_buddy: { label: "Buddy Explosion", desc: "If you <b>explode</b>, so does every neighbor who hasn't already stopped.", cost: 2 },

    return_discard: { label: "Old Fireworks", desc: "<b>Move</b> 2 cards from your discard back to your deck, then shuffle." },
    return_revealed: { label: "Try Again", desc: "<b>Move</b> 2 revealed cards back into your deck, then shuffle." },

    lower_threshold: { label: "Easy Ignite", desc: "Pick a color. Its threshold for exploding is <b>lowered by 4</b>." },
    raise_threshold: { label: "Cold Weather", desc: "Pick a color. Its threshold for exploding is <b>raised by 4</b>." },

    last_alive: { label: "Stick it out", desc: "If you're the last player alive, you get <b>any card</b> from the shop (for free)." },
    first_stop: { label: "Sudden Burst", desc: "If you're the first to stop, reveal 2 more cards without exploding.", cost: 2 },

    draw_safe: { label: "Safety Goggles", desc: "Once this round, look at your next card before revealing or stopping." },
    draw_risky: { label: "No Hesitation", desc: "You may reveal 3 cards this turn." },

    change_color: { label: "Colorshift", desc: "Tuck this card underneath another: it becomes the same color." },
    change_number: { label: "Numbershift", desc: "Tuck this card underneath another: it becomes the same number." },

    super_cracker: { label: "Super Cracker", desc: "You <b>explode</b> (unstoppable). This card is <b>worth 13 points</b>." },
    hide_card: { label: "Blind Eye", desc: "Turn any revealed card facedown." },

    // all the black card powers
    score_color: { label: "Double Sight", desc: "Scores double the <b>number of Black cards</b> that you have." },
    score_diversity: { label: "Multicolor", desc: "Scores the <b>number of unique actions</b> that your deck contains." },
    wildcard_up: { label: "Wildcard Up", desc: "Increases the total of <b>all colors</b> by 4." },
    wildcard_down: { label: "Wildcard Down", desc: "Decreases the total of <b>all colors</b> by 4." },
    cleanup: { label: "Cleanup", desc: "<b>Move</b> all revealed cards from any player to their discard pile." },
    strong_force: { label: "Strong Force", desc: "Force any player to <b>reveal</b> or <b>stop</b> on their next turn." },
    strong_destroy: { label: "Strong Destroy", desc: "You may <b>destroy</b> any card from yourself (deck, discard or revealed), then shuffle." },
    risky_rocket: { label: "Risky Rocket", desc: "From now on, if anyone <b>reveals</b>, they must reveal 2 cards at once." },
    pity_purchase: { label: "Pity Purchase", desc: "If you <b>explode</b>, discard your revealed cards. Then buy something <b>for 2 " + cIcon + "</b>." },
    explosion_self: { label: "Own Fault", desc: "Anyone who reveals a color they've already revealed, instantly <b>explodes</b>." },
    explosion_neighbor: { label: "Reckless Neighbor", desc: "Anyone who reveals the same number as the previous player, instantly <b>explodes</b>." },
    steal: { label: "Boom Burglar", desc: "<b>Steal</b> 1 revealed card from another player. Place it on your own discard." },
    safety_suit: { label: "Safety Suit", desc: "You <b>can't explode</b> for 2 turns. But you can only spend <b>half</b> your " + cIcon + " (rounded down)." },
    same_color_bonus: { label: "Style Points", desc: "If all your revealed cards share a color or number with another, <b>double</b> your " + cIcon + "."  }
}


const MISC =
{
    coin: { frame: 0 }
}

export 
{
    CardType,
    MISC,
    PACKS,
    ACTIONS
}
