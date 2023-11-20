
interface PowerData
{
    desc?: string,
    prob?: number, // all have a default of 1.0
    nums?: number[], // all have a default of 1-9 (all numbers)
    max?: number, // all have a default of Infinity
    min?: number, // all have a default of 1
}

type PowerSet = Record<string, PowerData>;
const POWERS:PowerSet = 
{
    new_lead: { desc: "The card you play becomes the new leading suit." },
    no_lead: { desc: "Nobody needs to follow suit.", max: 3 },
    new_trump: { desc: "Your (played) card is the new trump." },
    new_trump_bid: { desc: "Your BID card is the new trump." },
    wildcard: {  desc: "Your card is a wildcard: whatever suit and number you want.", max: 3 },
    no_ignore: { desc: "Cards in the same suit as your bid card are NOT ignored." },
    reverse_order: { desc: "Numerical order is reversed. (1 is highest, 9 is lowest.)" },
    force_takeback: { desc: "Force the previous player to play a different card (if possible)." },
    pick_start: { desc: "At the end of this trick, you pick the next Kittykeeper.", max: 2 },
    pick_start_conditional: { desc: "If you lose this trick, you pick the next Kittykeeper." },
    swap_played: { desc: "Swap one hand card with another player's hand card.", max: 2 },
    swap_hand: { desc: "After playing, swap your card with another one already played." },
    carousel_left: { desc: "All players give 2 cards to their LEFT (simultaneously).", max: 2 },
    carousel_right: { desc: "All players give 2 cards to their RIGHT (simultaneously).", max: 2 },
    shuffle_trick: { desc: "If you win this trick, shuffle the cards and give one back to each player.", max: 2 },

    same_suit_order_first: { desc: "Of all cards in the same suit, the FIRST one played is now highest.", max: 2 },
    same_suit_order_last: { desc: "Of all cards in the same suit, the LAST one played is now highest.", max: 2 },
    match_suit_lowest: { desc: "Anyone who matches suit with you, must play their LOWEST in that suit." },
    match_suit_highest: { desc: "Anyone who matches suit with you, must play their HIGHEST in that suit." },
    shuffle_hand: { desc: "Shuffle your hand and play a random card. (Ignoring all other rules.)", max: 2 },
    shuffle_hand_all: { desc: "Players must shuffle their hand and play blind.", max: 2 },
    play_above_5: { desc: "Players must play a card higher than 5 (if possible)." },
    play_below_5: { desc: "Players must play a card less than 5 (if possible)." },
    play_odd: { desc: "Players must play ODD cards (if possible)." },
    play_even: { desc: "Players must play EVEN cards (if possible)." },

    same_suit_ignore: { desc: "Any card that's the same suit as the previous card is ignored." },
    steal_from_trick: { desc: "At the end of this trick, swap one hand card with a trick card." },
    draw_new: { desc: "Draw 1 card from any trick already won; discard another card from your hand." },
    score_twice: { desc: "The winner of this trick scores it twice. (Divide the trick into two parts.)", max: 2 },
    score_none: { desc: "The winner of this trick doesn't score it. (Discard all cards.)", max: 2 },
    new_trump_number_1: { desc: "If only a single 1 was played, its suit is the trump.", max: 3 },
    new_trump_number_2: { desc: "If only a single 2 was played, its suit is the trump.", max: 2 },
    new_trump_number_3: { desc: "If only a single 3 was played, its suit is the trump.", max: 1 },
    limitless_power: { desc: "This trick, everybody may use as many powers as they want.", max: 2 },
    blind_play: { desc: "Players play their cards FACEDOWN. (Reveal them when the trick's done.)" },
    double_trick: { desc: "At the end of this trick, play another round before determining the winner.", max: 1 },

    reveal_suit: { desc: "Pick a suit. Everyone reveals all their cards in that suit.", max: 3 },
    reveal_number: { desc: "Pick a number. Everyone reveals all their cards with that number.", max: 2 },
    ignore_above_5: { desc: "Disregard all cards higher than 5." },
    ignore_below_5: { desc: "Disregard all cards less than 5." },
    no_trump: { desc: "This trick has no trump.", max: 2 },
    boost_below_5: { desc: "For all cards less than 5, add +9 added to their number.", max: 1 },
    nerf_above_5: { desc: "For all cards higher than 5, add -9 to their number.", max: 1 },
    end_promise: { desc: "Everyone sets aside one facedown card. Play those at the round's FINAL trick.", max: 1 }
}


interface CatData
{
    frame: number,
    color: string,
    colorLighten?: number,
    colorDarken?: number,
}

const CATS: Record<string, CatData> = 
{
    hearts: { frame: 0, color: "#B12B45", colorLighten: 50 },
    spades: { frame: 1, color: "#183C6A", colorLighten: 69 },
    diamonds: { frame: 2, color: "#572187" }, 
    clubs: { frame: 3, color: "#135D5A", colorLighten: 69 },
    hourglasses: { frame: 4, color: "#09511D", colorLighten: 78 },
    cups: { frame: 5, color: "#BD231F", colorLighten: 50 },
    stars: { frame: 6, color: "#3F5202", colorLighten: 69 },
    cats: { frame: 7, color: "#8E3616" },
    crowns: { frame: 8, color: "#2E2E2E", colorLighten: 76 }
}


const MISC =
{
    bg_cat: { frame: 0 },
    bg_cat_outline: { frame: 1 },
}

export 
{
    PowerData,
    CATS,
    POWERS,
    MISC
}
