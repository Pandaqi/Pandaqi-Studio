
interface GeneralData
{
    frame?: number,
    desc?: string,
    freq?: number,
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

const MISC:Record<string, GeneralData> =
{

}

export 
{
    MISC,
    POWER_CARDS,
}