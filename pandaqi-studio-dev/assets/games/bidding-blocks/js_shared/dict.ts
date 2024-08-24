
const EXPANSION = {
    combo_restrict: { frame: 0, desc: "If faceup in Evidence, only 1-card combos are allowed. If played, also <i>flip</i> one Evidence card.", num: -2 },
    steal_block: { frame: 1, desc: "If you have this card, you may <i>stop</i> anyone from <i>stealing</i> cards from you.", num: -1 },
    guess_lie: { frame: 2, desc: "If you have this card, you may always <i>lie</i> when someone <i>guesses</i> a card of yours.", num: 0 },
    murder_wildcard: { frame: 3, desc: "If part of the Murder, you already win by only guessing the other 2 numbers correctly.", num: 19 },
    combo_wildcard: { frame: 4, desc: "If part of a 3-card combo, it's a wildcard that can be any number. Otherwise, it's just its own number.", num: 20 },
    combo_punish: { frame: 5, desc: "If faceup in Evidence, if your 1-card combo is <i>blocked</i> (by another player), they steal 3 cards from <i>you</i> instead!", num: 21 }
    //guess_swap: { frame: 5, desc: "If someone guesses this exact card, swap your entire hand with them.", num: 21 },
}

export {
    EXPANSION
};