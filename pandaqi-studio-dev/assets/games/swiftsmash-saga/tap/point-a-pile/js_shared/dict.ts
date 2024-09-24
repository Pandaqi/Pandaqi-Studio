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
}
type GeneralDict = Record<string, GeneralData>

const DYNAMIC_STRINGS:Record<string,any[]> =
{
    "%sign%": ["+1", "-1"],
    "%num%": [2,3,4,5],
    "%numlow%": [3,4,5],
    "%numhigh%": [5,6],
    "%color%": Object.values(ColorType)
}

const REGULAR_CARDS:GeneralDict =
{
    empty: { frame: 0, desc: "", prob: 10 }, // just an empty card with nothing special
    score_raw: { frame: 1, desc: "I am <b>%sign% point</b>." },
    color_match: { frame: 2, desc: "I am <b>%sign% point</b> for every <b>%color% card</b> scored." },
    color_diff: { frame: 3, desc: "I am <b>+3 points</b> if you scored <b>every color</b> in the game." },
    color_group: { frame: 4, desc: "I am <b>%num% points</b> if you scored <b>%num% cards</b> of the same color." },
    color_specific: { frame: 5, desc: "I am <b>%num% points</b> if you scored <b>%num% %color% cards</b>." },
    num_cards: { frame: 6, desc: "I am <b>%num% points</b> if you scored (at least) <b>%numhigh% cards</b>." },
    empty_bonus: { frame: 7, desc: "I am <b>%sign% point</b> for every <b>empty card</b> scored." },
    score_temporary: { frame: 8, desc: "I am <b>%sign% point</b> while I am your last card scored.", prob: 0.5 },
    score_headpointer: { frame: 9, desc: "I am <b>%sign% point</b> while you are Headpointer.", prob: 0.5 }
}

const MISSION_CARDS:GeneralDict =
{
    color_same: { frame: 0, desc: "You need 5 cards of the same color." },
    color_diff: { frame: 1, desc: "You need at least 2 cards of every color in the game." },
    points: { frame: 2, desc: "You need 10 points." },
    text_cards: { frame: 3, desc: "You need at least 6 cards with text on them." },
    notext_cards: { frame: 4, desc: "You need at least 4 cards without text on them." },
    color_and_points: { frame: 5, desc: "You need 1 card of every color and at least 6 points." },
    color_and_num: { frame: 6, desc: "You need 1 card of every color and at least 6 cards." },
    num_cards: { frame: 7, desc: "You need at least 12 cards in your score pile." },
    num_and_points: { frame: 8, desc: "You need at least 8 cards in your score pile and 4 points." },
    color_specific: { frame: 9, desc: "You need %numhigh% %color% cards and %numlow% %color% cards." },
}

const ACTION_CARDS:GeneralDict =
{
    swap: { frame: 0, desc: "<b>Swap</b> 2 piles." },
    steal: { frame: 1, desc: "<b>Steal</b> 1 card from a pile you didn't win this round." },
    headpointer: { frame: 2, desc: "Immediately become <b>Headpointer</b>." },
    discard: { frame: 3, desc: "<b>Discard</b> 1 scored card from yourself or another player.", prob: 0.5 },
    battle: { frame: 4, desc: "If <b>multiple players</b> want your pile, fight it out with rock-paper-scissors instead." },
    merge: { frame: 5, desc: "<b>Merge</b> 2 piles into 1.", prob: 0.5 },
    switch: { frame: 6, desc: "<b>Swap</b> a scored card of yours with one of another player." },
    order: { frame: 7, desc: "<b>Move</b> a different scored card of yours to the end of your score pile." },
    takeall: { frame: 8, desc: "If <b>multiple players</b> want your pile, you win it." },
    takenone: { frame: 9, desc: "If <b>multiple players</b> want the same pile, nobody gets it." },
    redo: { frame: 10, desc: "<b>Redo</b> the current round. (Reset to the start and play it again.)", prob: 2 },
    changemind: { frame: 11, desc: "Change your mind and <b>tap a different pile</b> instead.", prob: 2 },
    drawmore: { frame: 12, desc: "This round, the Headpointer <b>draws 6 more cards</b> when creating piles." },
    colorstop: { frame: 13, desc: "Name a <b>color</b>. All such cards are removed from their piles." },
    actionstop: { frame: 14, desc: "<b>Nobody</b> can <b>trigger an action</b> this round." },
    trade: { frame: 15, desc: "If <b>multiple players</b> want your pile, negotiate a trade: give away scored cards to get the entire pile.", prob: 0.75 }
}

const RULE_CARDS:GeneralDict =
{
    color_diff: { frame: 0, desc: "You <b>can't</b> pick a pile that shows the <b>same color</b> as your last card scored.", prob: 10 },
    color_same: { frame: 1, desc: "You <b>must</b> pick a pile that shows the <b>same color</b> as your last card scored.", prob: 4 },
    neighbor_diff: { frame: 2, desc: "You <b>can't</b> pick the same pile as your <b>left neighbor</b>.", prob: 2 },
    neighbor_same: { frame: 3, desc: "You <b>must</b> pick the same pile as <b>one of your neighbors</b>.", prob: 2 },
    lead_penalty: { frame: 4, desc: "The player(s) with the <b>best score</b> can't pick the <b>largest pile(s)</b>." },
    behind_bonus: { frame: 5, desc: "The player(s) with the <b>worst score</b> point <b>after</b> the others have done so." },
    text_diff: { frame: 6, desc: "If your last card scored has <b>text</b>, you can't point at a pile with <b>text</b>.", prob: 2 },
    text_same: { frame: 7, desc: "If your last card scored shows <b>no text</b>, you can't point at a pile with a <b>textless</b> card." }
}

const SHY_CARDS:GeneralDict =
{
    active_only: { frame: 0, desc: "Only the <b>Headpointer</b> can pick me." },
    active_forbidden: { frame: 1, desc: "Only players who are <b>not the Headpointer</b> can pick me." },
    leader_forbidden: { frame: 2, desc: "Only player(s) who are <b>not in the lead</b> can pick me." },
    num_cards_less: { frame: 3, desc: "Only player(s) with <b>less than 5 cards</b> (scored) can pick me." },
    num_cards_more: { frame: 4, desc: "Only player(s) with <b>more than 5 cards</b> (scored) can pick me." },
    color_new: { frame: 5, desc: "Only player(s) who <b>don't have my color yet</b> can pick me." },
    color_same: { frame: 6, desc: "Only player(s) who <b>have my color</b> (scored) can pick me." },
    shy_new: { frame: 7, desc: "Only player(s) <b>without shy cards</b> (scored) can pick me." },
}

const MATERIAL:Record<CardType, GeneralDict> =
{
    [CardType.REGULAR]: REGULAR_CARDS,
    [CardType.MISSION]: MISSION_CARDS,
    [CardType.ACTION]: ACTION_CARDS,
    [CardType.RULE]: RULE_CARDS,
    [CardType.SHY]: SHY_CARDS,
}

const MISC:Record<string, GeneralData> =
{

}

export {
    CardType,
    ColorType,
    MISC,
    MATERIAL,
    DYNAMIC_STRINGS
};