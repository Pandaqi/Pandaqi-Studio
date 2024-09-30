import Point from "js/pq_games/tools/geometry/point"

interface GeneralData
{
    frame?: number,
    desc?: string,
    freq?: number,
    tint?: string,
}

// Aiming for 18 of these cards, as that fits perfectly on 2 A4 pages.
const POWER_CARDS:Record<string,GeneralData> =
{
    add_number: { frame: 0, desc: "<b>Add</b> a card of the next highest (unused) number to all player's decks.", freq: 3 },
    reroll: { frame: 1, desc: "<b>Reroll</b> all of your dice." },
    reroll_other: { frame: 2, desc: "Force a player to <b>reroll</b> their dice." },
    wildcard_ignore: { frame: 3, desc: "All <b>wildcards</b> are ignored this round." },
    wildcard_make: { frame: 4, desc: "State a <b>number</b>. It's now a <b>wildcard</b>: any number you want." },
    reveal_other: { frame: 5, desc: "Force a player to <b>reveal</b> two of their dice." },
    reveal_self: { frame: 6, desc: "<b>Reveal</b> all your dice to <b>skip your turn</b>." },
    no_bid: { frame: 7, desc: "You <b>don't</b> need to guess higher than the previous player, only <b>equal</b>." },
    lower_bid: { frame: 8, desc: "You must guess <b>lower</b> than the previous guess." },
    exact_bid: { frame: 9, desc: "From now on, a guess is only correct if it matches <b>exactly</b>." },
    loss_reduction: { frame: 10, desc: "This round's loser only <b>loses 1 card</b>, not an entire die." },
    reroll_all: { frame: 11, desc: "<b>Everyone rerolls all</b> of their dice." },
    swap: { frame: 12, desc: "<b>Swap</b> one of your dice with that of another player." },
    special_bid: { frame: 13, desc: "From now on, only guesses about (number of) <b>Special Cards</b> are allowed." },
    draw: { frame: 14, desc: "<b>Draw</b> an extra card from the deck into your hand." },
    discard: { frame: 15, desc: "<b>Discard</b> the top card of any one die." }
}

const WILDCARD_DATA:GeneralData = { frame: -1, desc: "Wildcard!\nRepresents any number from any guess." }

const MISC:Record<string, GeneralData> =
{
    dice_1: { frame: 0, tint: "#ff4141" },
    dice_2: { frame: 1, tint: "#ffb800" },
    dice_3: { frame: 2, tint: "#3bd900" },
    dice_4: { frame: 3, tint: "#00c0c5" },
    dice_5: { frame: 4, tint: "#8eb4ff" },
    dice_6: { frame: 5, tint: "#e073ff" },
    text_box: { frame: 6 },
    bg: { frame: 7 },
    wacky_box_1: { frame: 8 },
    wacky_box_2: { frame: 9 },
    wacky_box_3: { frame: 10 },
    wacky_box_4: { frame: 11 },
    dice_7: { frame: 12, tint: "#ff8773" },
    dice_8: { frame: 13, tint: "#ddeb5e" },
    dice_9: { frame: 14, tint: "#ab73ff" }
}

const DICE_ARRANGEMENTS = [
    [],
    [4],
    [0,8],
    [0,4,8],
    [0,2,6,8],
    [0,2,4,6,8],
    [0,2,3,5,6,8],
    [0,2,3,4,5,6,8],
    [0,1,2,3,5,6,7,8],
    [0,1,2,3,4,5,6,7,8]
]

const DICE_POSITIONS = [
    new Point(-1,-1), // 0-2
    new Point(0,-1),
    new Point(1,-1),
    new Point(-1,0), // 3-5
    new Point(0,0),
    new Point(1,0),
    new Point(-1,1), // 6-8
    new Point(0,1),
    new Point(1,1)
]

export 
{
    MISC,
    POWER_CARDS,
    DICE_POSITIONS,
    DICE_ARRANGEMENTS,
    WILDCARD_DATA
}