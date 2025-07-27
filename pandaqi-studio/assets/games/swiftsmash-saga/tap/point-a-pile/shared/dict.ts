enum CardType
{
    REGULAR = "regular",
    MISSION = "mission",
    ACTION = "action",
    RULE = "rule",
    SHY = "shy",
}

enum ColorType
{
    RED = "red",
    BLUE = "blue",
    GREEN = "green",
    PURPLE = "purple"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    prob?: number,
    label?: string
}
type GeneralDict = Record<string, GeneralData>

const DYNAMIC_STRINGS:Record<string,any[]> =
{
    "%sign%": ["+1", "-1"],
    "%signweighted%": ["+1", "+1", "+1", "-1"],
    "%num%": [2,3,4,5],
    "%numlow%": [3,4,5],
    "%numhigh%": [5,6],
    "%color%": Object.values(ColorType)
}

const REGULAR_CARDS:GeneralDict =
{
    empty: { frame: 0, desc: "", label: "Color", prob: 7 }, // just an empty card with nothing special
    score_raw: { frame: 1, desc: "I am <b>%sign% point</b>.", label: "Score" },
    color_match: { frame: 2, desc: "I am <b>%signweighted% point</b> for every <b>%color% card</b> scored.", label: "Color Match" },
    color_diff: { frame: 3, desc: "I am <b>%numlow% points</b> if you scored <b>every color</b> in the game.", label: "Color Diff" },
    color_group: { frame: 4, desc: "I am <b>%num% points</b> if you scored <b>%num% cards</b> of the same color.", label: "Color Group" },
    color_specific: { frame: 5, desc: "I am <b>%num% points</b> if you scored <b>%num% %color% cards</b>.", label: "Color Specific" },
    num_cards: { frame: 6, desc: "I am <b>%num% points</b> if you scored (at least) <b>%numhigh% cards</b>.", label: "Num Cards" },
    empty_bonus: { frame: 7, desc: "I am <b>%signweighted% point</b> for every <b>textless card</b> scored.", label: "Empty Reward" },
    score_temporary: { frame: 8, desc: "I am <b>%signweighted% point</b> while I am your last card scored.", label: "Last Reward", prob: 0.5 },
    score_headpointer: { frame: 9, desc: "I am <b>%sign% point</b> while you are Headpointer.", label: "Head Reward", prob: 0.5 }
}

const MISSION_CARDS:GeneralDict =
{
    color_same: { frame: 0, desc: "You need <b>5 cards</b> of the <i>same color</i>." },
    color_diff: { frame: 1, desc: "You need at least <b>2 cards</b> of <i>every color</i> in the game." },
    points: { frame: 2, desc: "You need <b>10 points</b>." },
    text_cards: { frame: 3, desc: "You need at least <b>6 cards</b> <i>with text</i> on them." },
    notext_cards: { frame: 4, desc: "You need at least <b>5 cards</b> <i>without text</i> on them." },
    color_and_points: { frame: 5, desc: "You need <b>1 card</b> of <i>every color</i> and at least <b>6 points</b>." },
    color_and_num: { frame: 6, desc: "You need <b>1 card</b> of <i>every color</i> and at least <b>6 cards</b>." },
    num_cards: { frame: 7, desc: "You need at least <b>12 cards</b> in your score pile." },
    num_and_points: { frame: 8, desc: "You need at least <b>8 cards</b> in your score pile and <b>4 points</b>." },
    color_specific: { frame: 9, desc: "You need <b>%numhigh% %color% cards</b> and <b>%numlow% %color% cards</b>." },
}

const ACTION_CARDS:GeneralDict =
{
    swap: { frame: 0, desc: "<b>Swap</b> 2 piles.", label: "Swap" },
    steal: { frame: 1, desc: "<b>Steal</b> 1 card from a pile you didn't win this round.", label: "Steal" },
    headpointer: { frame: 2, desc: "Immediately become <b>Headpointer</b>.", label: "Headpointer" },
    discard: { frame: 3, desc: "<b>Discard</b> 1 scored card from yourself or another player.", label: "Discard", prob: 0.5 },
    battle: { frame: 4, desc: "<b>Multiple players</b> want a pile? Fight it out with <i>Rock Paper Scissors</i> instead.", label: "Random" },
    merge: { frame: 5, desc: "<b>Merge</b> 2 piles into 1.", label: "Merge", prob: 0.5 },
    switch: { frame: 6, desc: "<b>Swap</b> a scored card of yours with one of another player.", label: "Switch" },
    order: { frame: 7, desc: "<b>Move</b> a different scored card of yours to the end of your score pile.", label: "Reorder" },
    takeall: { frame: 8, desc: "<b>Multiple players</b> want a pile? You win it.", label: "Take All" },
    takenone: { frame: 9, desc: "<b>Multiple players</b> want a pile? Nobody gets it.", label: "Take None" },
    redo: { frame: 10, desc: "<b>Redo</b> the current round. (Reset to the start and play it again.)", label: "Redo", prob: 2 },
    changemind: { frame: 11, desc: "Change your mind and <b>tap a different pile</b> instead.", label: "Change Mind", prob: 2 },
    drawmore: { frame: 12, desc: "This round, the Headpointer <b>draws 6 more cards</b> when creating piles.", label: "Draw More" },
    colorstop: { frame: 13, desc: "Name a <b>color</b>. All such cards are removed from their piles.", label: "Color Stop" },
    actionstop: { frame: 14, desc: "<b>Nobody</b> can <b>trigger an action</b> this round.", label: "Action Stop" },
    trade: { frame: 15, desc: "<b>Multiple players</b> want a pile? Give all others a scored card to win it alone.", label: "Trade", prob: 0.75 }
}

const RULE_CARDS:GeneralDict =
{
    color_diff: { frame: 0, desc: "You <b>can't</b> pick a pile that shows the <b>same color</b> as your last card scored.", label: "Not Last", prob: 10 },
    color_same: { frame: 1, desc: "You <b>must</b> pick a pile that shows the <b>same color</b> as your last card scored.", label: "Force Last", prob: 4 },
    neighbor_diff: { frame: 2, desc: "You <b>can't</b> pick the same pile as your <b>left neighbor</b>.", label: "Not Friends", prob: 2 },
    neighbor_same: { frame: 3, desc: "You <b>must</b> pick the same pile as <b>one of your neighbors</b>.", label: "Force Friends", prob: 2 },
    lead_penalty: { frame: 4, desc: "The player(s) with the <b>best score</b> can't pick the <b>largest pile(s)</b>.", label: "Leading Curse" },
    behind_bonus: { frame: 5, desc: "The player(s) with the <b>worst score</b> point <b>after</b> the others.", label: "Trailing Reward" },
    text_diff: { frame: 6, desc: "If your last card scored has <b>text</b>, you can't point at a pile with <b>text</b>.", label: "Not Text", prob: 2 },
    text_same: { frame: 7, desc: "If your last card scored is <b>textless</b>, you can't point at a pile with a <b>textless</b> card.", label: "Not Textless" }
}

const SHY_CARDS:GeneralDict =
{
    active_only: { frame: 0, desc: "Only the <b>Headpointer</b> can pick me.", label: "Head Only" },
    active_forbidden: { frame: 1, desc: "Only players who are <b>not the Headpointer</b> can pick me.", label: "Head Veto" },
    leader_forbidden: { frame: 2, desc: "Only player(s) who are <b>not in the lead</b> can pick me.", label: "Leader Veto" },
    num_cards_less: { frame: 3, desc: "Only player(s) with <b>fewer than 5 cards</b> (scored) can pick me.", label: "Hand Min" },
    num_cards_more: { frame: 4, desc: "Only player(s) with <b>more than 5 cards</b> (scored) can pick me.", label: "Hand Plus" },
    color_new: { frame: 5, desc: "Only player(s) who <b>don't have my color yet</b> can pick me.", label: "Color New" },
    color_same: { frame: 6, desc: "Only player(s) who <b>have my color</b> (scored) can pick me.", label: "Color Same" },
    shy_new: { frame: 7, desc: "Only player(s) <b>without shy cards</b> (scored) can pick me.", label: "Not Shy" },
}

const MATERIAL:Record<CardType, GeneralDict> =
{
    [CardType.REGULAR]: REGULAR_CARDS,
    [CardType.MISSION]: MISSION_CARDS,
    [CardType.ACTION]: ACTION_CARDS,
    [CardType.RULE]: RULE_CARDS,
    [CardType.SHY]: SHY_CARDS,
}

const TYPES =
{
    [CardType.REGULAR]: { frame: 0 },
    [CardType.MISSION]: { frame: 1 },
    [CardType.ACTION]: { frame: 2 },
    [CardType.RULE]: { frame: 3 },
    [CardType.SHY]: { frame: 4 }
}

const CARD_TEMPLATES =
{
    [ColorType.RED]: { frame: 0, hex: "#fa3f3f" },
    [ColorType.BLUE]: { frame: 1, hex: "#3faffa" },
    [ColorType.GREEN]: { frame: 2, hex: "#63ca2b" },
    [ColorType.PURPLE]: { frame: 3, hex: "#a459e1" },
    [CardType.MISSION]: { frame: 4, hex: "#dbd616" }
}

export {
    CardType,
    ColorType,
    MATERIAL,
    DYNAMIC_STRINGS,
    TYPES,
    CARD_TEMPLATES
};