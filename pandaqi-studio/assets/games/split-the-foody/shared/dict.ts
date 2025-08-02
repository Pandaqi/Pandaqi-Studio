
export interface PowerData
{
    frame?: number,
    label?: string,
    desc?: string,
    num?: number|string,
    freq?: number,
    score?: boolean, 
}

type PowerSet = Record<string, PowerData>;
const POWERS_BASE:PowerSet = 
{
    empty_chest: { frame: 0, label: "Empty Chest", desc: "", num: -4, freq: 2 },
    rotten_eggs: { frame: 1, label: "Rotten Eggs", desc: "Take <em>1 card</em> from every bid and add it to your own.", num: -3, freq: 4 },
    infested_bread: { frame: 2, label: "Infested Bread", desc: "All bids this round are <em>open</em>.", num: -2, freq: 6 }, // @TODO: find something better, perhaps?
    fish_skeleton: { frame: 3, label: "Fish Skeleton", desc: "Each player must <em>score</em> all <em>minus cards</em> in their bid.", num: -1, freq: 8 },
    pepper: { frame: 4, label: "Pearl Pepper", desc: "The round instantly ends in <em>Mutiny</em>. Highest bid is calculated by <em>total value</em>.", num: 0, freq: 4 },
    fish: { frame: 5, label: "Goldfish", desc: "Force the next player to <em>Bid</em> or <em>Play</b>.", num: 1, freq: 8 },
    bread: { frame: 6, label: "Bread Booty", desc: "Add <em>2 cards</em> to the treasure. Only you may look at them.", num: 2, freq: 7 },
    eggs: { frame: 7, label: "Egg Bag", desc: "<em>Reveal</em> the treasure.", num: 3, freq: 6 },
    rum: { frame: 8, label: "Ruby Rum", desc: "Look at the treasure. <em>Steal</em> 1 card.", num: 4, freq: 5 },
    pancake: { frame: 9, label: "Gold Pancake", desc: "Force the next player to <em>Pass</em>.", num: 5, freq: 4 },
    banana: { frame: 10, label: "Banana Box", desc: "<em>Draw 4 cards</em> from the deck into your hand.", num: 6, freq: 3 },
    pizza: { frame: 11, label: "Pirate Pizza", desc: "Steal the <em>entire treasure</em>. The start player scores this card.", num: 7, freq: 2 },
    filled_chest: { frame: 12, label: "Filled Chest", desc: "", num: 8, freq: 1 } 
}

const POWERS_APPETITE:PowerSet =
{
    empty_chest: { frame: 0, label: "Locked Box", desc: "", num: -4, freq: 1 },
    rotten_apple: { frame: 1, label: "Rotten Apple", desc: "<em>Discard</em> any card(s) from <em>any bid</em> (without looking), except your own.", num: -3, freq: 2 },
    poisoned_wine: { frame: 2, label: "Poisoned Wine", desc: "The start player receives <em>no bids</em> at the end", num: -2, freq: 3 },
    spoiled_cabbage: { frame: 3, label: "Spoiled Cabbage", desc: "This round, losing bids must be <em>scored</em> (when returning to their owner)", num: -1, freq: 4 },
    chicken: { frame: 4, label: "Scurvy Chicken", desc: "<em>Reverse</em> turn order.", num: 0, freq: 2 },
    cabbage: { frame: 5, label: "Pedestal Cabbage", desc: "From now on, players must bid <em>more</em> than the previous player, or <em>Pass</em>.", num: 1, freq: 4 },
    wine: { frame: 6, label: "Shiny Winy", desc: "Add 2 cards to <em>any bid</em>, except your own.", num: 2, freq: 4 },
    apple: { frame: 7, label: "Golden Apple", desc: "The round ends. <em>Shuffle</em> the treasure before splitting.", num: 3, freq: 3 },
    pineapple: { frame: 8, label: "Pirate Pine", desc: "Take your bid back into your hand.", num: 4, freq: 3 },
    grapes: { frame: 9, label: "Grapecrown", desc: "This round, losing bids do <em>not</em> return to their owner.", num: 5, freq: 2 },
    onion: { frame: 10, label: "Pearl Onion", desc: "<em>Score</em> the current bid of any player.", num: 6, freq: 2 },
    biscuit: { frame: 11, label: "Biscuit Booty", desc: "This round, decide <em>per card</em> if you want to take it into your hand or score it.", num: 7, freq: 2 },
    filled_chest: { frame: 12, label: "Overflown Chest", desc: "", num: 8, freq: 1 } 
}

const POWERS_COINS:PowerSet =
{
    sabre: { frame: 0, label: "Banana Sabre", desc: "Wildcard; any number you want it to be.", num: "?", freq: 5, score: true },
    spyglass: { frame: 1, label: "Soupy Spyglass", desc: "When <em>received</em>, you must <em>score</em> this particular card.", num: -3, freq: 3, score: true },
    barrel: { frame: 2, label: "Basic Barrel", desc: "Worth as much as your <em>lowest scoring</em> card.", num: 2, freq: 3, score: true },
    compass: { frame: 3, label: "Confused Compass", desc: "Anytime you score, place 1 card at a <em>wrong stack</em>.", num: -1, freq: 4, score: true },
    pearl: { frame: 4, label: "Pirate Pearl", desc: "<em>Flips</em> all numbers on one stack of scoring cards (negative <-> positive)", num: 1, freq: 4, score: true },
    bottle: { frame: 5, label: "Ship in a Bottle", desc: "Worth as much as your <em>number</em> of negative scoring cards.", num: 0, freq: 3, score: true },
    diamond: { frame: 6, label: "Dazzling Diamond", desc: "Worth as much as your <em>highest</em> scoring card.", num: -2, freq: 3, score: true },
    coin: { frame: 7, label: "Chewy Coin", desc: "Each coin is worth the <em>number of coins</em> you score.", num: 4, freq: 5, score: true },
    artefact: { frame: 8, label: "Amulet Artefact", desc: "Only scores if you have the <em>least</em> artefacts (of all artefact owners)", num: 5, freq: 5, score: true },
    hook: { frame: 9, label: "Hungry Hook", desc: "Scores +6 if you have <em>at least 3 Hooks</em>; otherwise -12.", num: 6, freq: 5, score: true },
}


export const SETS:Record<string,PowerSet> = 
{
    base: POWERS_BASE,
    appetite: POWERS_APPETITE,
    coins: POWERS_COINS,
}

// This is for any decorations, backgrounds, textures needed for general card layout
export const MISC =
{
    coin: { frame: 0 },
    scroll: { frame: 1 },
    rope: { frame: 2 },
    coin_score: { frame: 3 }
}