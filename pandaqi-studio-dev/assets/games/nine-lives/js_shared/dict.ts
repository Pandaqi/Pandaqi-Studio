
enum Type
{
    LIFE = "LIFE",
    CAT = "CAT"
}

interface PowerData
{
    core?: boolean,
    label?: string,
    frame?: number, // default frame in default spritesheet, applicable to MOST (non-dynamic) powers
    drawNum?: number, // how many cards you may draw at end of turn
    reqs?: string[] // any requirements that should be dynamically filled in
    prob?: number,
    desc?: string
}

// @NOTE: power names should not have underscores; those are used for creating dynamic keys for powers that need it
// (and thus, when drawing the card, to check which specific subType we have to draw)
type PowerSet = Record<string, PowerData>;
const POWERS:PowerSet = 
{
    skip: { label: "Skip Turn", drawNum: 2, frame: 0, prob: 1.5, desc: "Skip your turn.", core: true },
    copycat: { label: "Copycat", drawNum: 1, frame: 1, prob: 1.5, desc: "Copy the current power of another player.", core: true },
    wildcard: { label: "Wildcard", drawNum: 1, frame: 2, desc: "Play any card (regardless of rules)!", core: true },
    wildcardPaid: { label: "Wildcard Paid", drawNum: 1, frame: 3, prob: 2, desc: "Give away 1 card. Now you're allowed to play any card (regardless of rules)!" },
    override: { label: "Replace", drawNum: 2, frame: 4, prob: 1.5, desc: "Play your card on top of an existing card.", core: true },
    swap: { label: "Swap", drawNum: 2, frame: 5, prob: 1.5, desc: "Trade your card with one on the table. (That is, you get the one traded in your hand.)" },
    steal: { label: "Steal", drawNum: 1, frame: 6, prob: 1.5, desc: "Steal a card from the table or another player." },
    riskyDeck: { label: "Draw and Play", drawNum: 1, frame: 7, desc: "Draw 2 cards from the deck. You must play one of those." },
    riskyPlayer: { label: "Steal and Play", drawNum: 3, frame: 8, desc: "Steal 2 cards from another player. You must play one of them." },
    doubleTurn: { label: "Double Turn", drawNum: 2, frame: 9, prob: 2.0, desc: "You may take 2 turns, but the next player MUST take 2 turns." },
    rotateCards: { label: "Card Carousel", drawNum: 1, frame: 10, desc: "Pick a direction. Everyone gives 2 cards to their neighbor in that direction (simultaneously)." },
    inspect: { label: "Inspect", drawNum: 1, frame: 11, prob: 1.75, desc: "All other players must play with their hand open (for the remainder of this round).", core: true }, 
    shuffleLives: { label: "Shuffle Lives", drawNum: 2, frame: 12, desc: "Change the order of a Life Deck. (Could be your own of that of another player.)" },
    singleCat: { label: "Single Cat", drawNum: 2, frame: 13, desc: "Pick one icon from the card (you're going to play this round). Pretend that's the only one; ignore all the others." },
    forceWager: { label: "Force Wager", drawNum: 1, frame: 14, desc: "The next player MUST wager a life." },
    forbidWager: { label: "Forbid Wager", drawNum: 1, frame: 15, desc: "The next player is NOT allowed to wager a life!" },

    shapeshift: { label: "Shapeshift", reqs: ["cat", "cat"], drawNum: 2, prob: 2.0, desc: "One type of cat actually becomes a different type.", core: true },
    numbershift: { label: "Numbershift", reqs: ["cat", "num"], drawNum: 1, prob: 1.5, desc: "Whatever card you play, pretend the cat type shown appears exactly as often as the number shown." },
    ignore: { label: "Ignore", reqs: ["cat"], drawNum: 1, prob: 1.25, desc: "Completely ignore the existence of this type of cat. (You don't check its total number for any purpose.)" },
    forbid: { label: "Forbid", reqs: ["cat"], drawNum: 3, prob: 1.25, desc: "You can't play this type of cat.", core: true },
    plus: { label: "More Allowed", reqs: ["cat"], drawNum: 2, prob: 1.25, desc: "You're allowed to exceed the limit (9) for the type of cat shown.", core: true },
}

interface CatData
{
    frame: number,
    color: string,
    excludeFromCombos?: boolean
}

const CATS: Record<string, CatData> = 
{
    circle: { frame: 0, color: "#134B00" }, // frame + 1 is the simplified version
    square: { frame: 2, color: "#084670" },
    triangle: { frame: 4, color: "#601B01" },
    star: { frame: 6, color: "#29125C", excludeFromCombos: true }
}

const MISC =
{
    bg_cat: { frame: 0 },
    heart: { frame: 1 },
    heart_simple: { frame: 2 },
    heart_outline: { frame: 3 },
    heart_life: { frame: 4 },
    cross: { frame: 5 },
    arrow: { frame: 6 },
    card: { frame: 7 },
    plus: { frame: 8 },
    ignore: { frame: 9 }
}

export 
{
    Type,
    PowerData,
    CATS,
    POWERS,
    MISC
}
