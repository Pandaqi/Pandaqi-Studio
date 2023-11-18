
interface PowerData
{
    frame?: number,
    label?: string,
    desc?: string,
    num?: number,
    freq?: number
}

type PowerSet = Record<string, PowerData>;
const POWERS_BASE:PowerSet = 
{
    empty_chest: { frame: 0, label: "Empty Chest", desc: "", num: -4, freq: 2 },
    rotten_eggs: { frame: 1, label: "Rotten Eggs", desc: "Take 1 card from every bid and add it to your own.", num: -3, freq: 4 },
    infested_bread: { frame: 2, label: "Infested Bread", desc: "All bids this round are open", num: -2, freq: 6 }, // @TODO: find something better
    fish_skeleton: { frame: 3, label: "Fish Skeleton", desc: "Each player must score all MINUS cards in their bid.", num: -1, freq: 8 },
    pepper: { frame: 4, label: "Pearl Pepper", desc: "The round instantly ends in Mutiny. Highest bid is calculated by total value.", num: 0, freq: 4 },
    fish: { frame: 5, label: "Goldfish", desc: "Force the next player to BID or PLAY.", num: 1, freq: 8 },
    bread: { frame: 6, label: "Bread Booty", desc: "Add 2 cards to the treasure. Only you may look at them.", num: 2, freq: 7 },
    eggs: { frame: 7, label: "Egg Bag", desc: "Reveal the treasure.", num: 3, freq: 6 },
    rum: { frame: 8, label: "Ruby Rum", desc: "Look at the treasure. Steal 1 card.", num: 4, freq: 5 },
    pancake: { frame: 9, label: "Gold Pancake", desc: "Force the next player to PASS.", num: 5, freq: 4 },
    banana: { frame: 10, label: "Banana Box", desc: "Draw 4 cards from the deck into your hand.", num: 6, freq: 3 },
    pizza: { frame: 11, label: "Pirate Pizza", desc: "Steal the entire treasure. The start player scores this card.", num: 7, freq: 2 },
    filled_chest: { frame: 12, label: "Filled Chest", desc: "", num: 8, freq: 1 } 
}

// @TODO: change empty_chest and filled_chest to something else anyway?
const POWERS_APPETITE:PowerSet =
{
    empty_chest: { frame: 0, label: "Empty Chest", desc: "", num: -4, freq: 1 },
    rotten_apple: { frame: 1, label: "Rotten Apple", desc: "Discard any card(s) from any bid (without looking), except your own.", num: -3, freq: 2 },
    poisoned_wine: { frame: 2, label: "Poisoned Wine", desc: "The start player receives no bids at the end", num: -2, freq: 3 },
    spoiled_cabbage: { frame: 3, label: "Spoiled Cabbage", desc: "This round, losing bids must be scored (when returning to their owner)", num: -1, freq: 4 },
    chicken: { frame: 4, label: "Scurvy Chicken", desc: "Reverse turn order.", num: 0, freq: 2 },
    cabbage: { frame: 5, label: "Pedestal Cabbage", desc: "From now on, players must bid MORE than the previous player, or PASS.", num: 1, freq: 4 },
    wine: { frame: 6, label: "Shiny Winy", desc: "Add 2 cards to any bid, except your own.", num: 2, freq: 4 },
    apple: { frame: 7, label: "Golden Apple", desc: "The round ends. Shuffle the treasure before splitting.", num: 3, freq: 3 },
    pineapple: { frame: 8, label: "Pirate Pine", desc: "Take your bid back into your hand.", num: 4, freq: 3 },
    grapes: { frame: 9, label: "Grapecrown", desc: "This round, losing bids do not return to their owner.", num: 5, freq: 2 },
    onion: { frame: 10, label: "Pearl Onion", desc: "Score the current bid of any player.", num: 6, freq: 2 },
    biscuit: { frame: 11, label: "Biscuit Booty", desc: "This round, decide PER CARD if you want to take it into your hand or score it.", num: 7, freq: 2 },
    filled_chest: { frame: 12, label: "Filled Chest", desc: "", num: 8, freq: 1 } 
}

// @TODO
const POWERS_COINS:PowerSet =
{

}

const SETS:Record<string,PowerSet> = 
{
    base: POWERS_BASE,
    appetite: POWERS_APPETITE,
    coins: POWERS_COINS,
}

// This is for any decorations, backgrounds, textures needed for general card layout
const MISC =
{
    // @TODO
}

export 
{
    PowerData,
    SETS,
    MISC
}
