
enum CardType
{
    DICE = "dice",
    CONTRACT = "contract"
}

enum ContractType
{
    REGULAR = "regular",
    BATTLE = "battle",
    FORCED = "forced"
}

interface GeneralData
{
    frame?: number,
    label?: string,
    color?: string,
    desc?: string,
    descBattle?: string,
    prob?: number, // 1.0 by default
    sets?: string[], // ["base", "lost"] by default
    battle?: boolean, // can be used for battle cards
    battleExclusive?: boolean, // can ONLY be used for battle cards, not regular ones
    noNumber?: boolean, // if true, this contract test has no number at the end
    filterWhat?: string[], // [] by default
    requireCompare?: string[], // [] by default
    diff?: number, // 1.0 by default; the difficulty of that contractPart
    diffScaleRolls?: number, // 0 by default; an extra difficulty factor based on the NUMBER OF ROLLS
    diffScaleNumber?: number, // 0 by default; an extra difficulty factor based on the NUMBER randomly selected in the contractPart
}
type GeneralDict = Record<string, GeneralData>

const NUMBERS:GeneralDict = 
{
    "-1": { color: "#b394ff", label: "Minus One" },
    0: { color: "#7997ff", label: "Zero" },
    1: { color: "#9fdfff", label: "One" },
    2: { color: "#71e4c6", label: "Two" },
    3: { color: "#9ad85d", label: "Three" },
    4: { color: "#c9e272", label: "Four" },
    5: { color: "#fff79f", label: "Five" },
    6: { color: "#f7af79", label: "Six" },
    7: { color: "#fc9996", label: "Seven" },
    8: { color: "#f279ff", label: "Eight" },
}

const CONTRACT_DO_WHO:GeneralDict =
{
    all: { desc: "All Souls", prob: 8, battle: true },
    all_except: { desc: "All Souls except 1", diff: 2 },
}

const CONTRACT_DO_FREQ:GeneralDict =
{
    once: { desc: "once", battle: true },
    x_times: { desc: "%numfreq% times", battle: true },
    turnout: { desc: "Turnout times" },
    loop: { desc: "until somebody wins", battle: true, battleExclusive: true },
}

const CONTRACT_DO_MOD:GeneralDict =
{
    empty: { desc: "", prob: 5, diff: 0, battle: true },
    half_deck: { desc: "using only half their deck", diff: -0.5 }, // using fewer cards gives more certainty, so easier diff
    x_cards: { desc: "using only %sizedie% of their cards", diff: -0.5 },
    simul: { desc: "simultaneously", prob: 0.5, sets: ["lost"], diff: 2 }, // simultaneous adds way more uncertainty and actions are harder to use well, so harder diff
}

const CONTRACT_TEST_WHAT:GeneralDict =
{
    total: { desc: "The sum of results", descBattle: "The sum of your results is", battle: true },
    all: { desc: "All results", diff: 2, descBattle: "All of your results are", battle: true },
    none: { desc: "No results", diff: 2, descBattle: "None of your results are", battle: true },
    some: { desc: "%boundary% %numdice% results", diff: 1.5 },
    extreme: { desc: "The %extreme% result", descBattle: "Your %extreme% result is", battle: true },
    duplicates: { desc: "The number of same results", diff: 2 },
    differences: { desc: "The number of different results", diff: 2 },
    actions: { desc: "The number of results %include% an action", sets: ["lost"], descBattle: "Your number of results %include% action is", battle: true },
    sequence: { desc: "Each consecutive result", requireCompare: ["sequence"], diff: 2 }
}

const CONTRACT_TEST_COMPARE:GeneralDict =
{
    lower: { desc: "lower than", battle: true },
    higher: { desc: "higher than", battle: true },
    equal: { desc: "equal to", prob: 0.2, sets: ["lost"], diff: 2 }, // make less likely, because very hard
    within_margin: { desc: "within distance %margin% of one another", filterWhat: ["all", "none", "some"], noNumber: true, sets: ["lost"], diff: 3 }, // extra high diff because we have no NUMBER after it to add diff
    sequence: { desc: "%compare% the previous result", filterWhat: ["sequence"], noNumber: true, diff: 3 }
}

const CONTRACT_TEST_NUMBER:GeneralDict =
{
    empty: { desc: "", prob: 0, diff: 0 },
    number: { desc: "%num%", prob: 10 },
    turnout: { desc: "%mult% x Turnout", diff: 1.5 },
    contracts: { desc: "your number of scored contracts", sets: ["lost"] },
    actions: { desc: "%mult% x results with an action", diff: 2 },
    rolls: { desc: "the total number of rolls", diff: 1.5 },
    battle: { desc: "that of your opponent(s)", battle: true, battleExclusive: true }
}

const CONTRACT_SPECIAL:GeneralDict =
{
    empty: { desc: "", prob: 10, diff: 0, battle: true },
    actions_none: { desc: "Actions don't work", diff: 3 },
    actions_cond: { desc: "Actions on numbers %compare% %num% don't work", diff: 2 },
    actions_extreme: { desc: "Only the %rank% action rolled triggers", diff: 1.5 },
    actions_max: { desc: "You instantly fail if more than %numactions% actions appear.", diff: 1 },
    special_soul_reroll: { desc: "One Soul may choose to reroll once (for free)", diff: -1 },
    special_soul_backout: { desc: "One Soul is allowed to back out of the challenge before it's done (at no penalty)", sets: ["lost"], diff: -1 },
    insta_fail_action: { desc: "If two Souls roll the same action, you instantly fail", prob: 0.5, diff: 2 },
    insta_fail_number: { desc: "If two Souls roll the same number, you instantly fail", prob: 0.5, sets: ["lost"], diff: 3 },
    insta_win_number: { desc: "If two Souls roll the same number, you instantly succeed", prob: 0.33, sets: ["lost"], diff: -3 },
    insta_win_action: { desc: "If two Souls roll the same action, you instantly succeed", prob: 0.33, diff: -2 },
    blind: { desc: "The active player must roll blind and only check their result once everyone else is done", diff: 1 }
}

const DYNAMIC_REPLACEMENTS:Record<string,any[]> =
{
    "%num%": [2,3,4,5],
    "%numfreq%": [2,3],
    "%sizedie%": [2,3,4],
    "%boundary%": ["At most", "At least", "Exactly"],
    "%numdice%": [1,2,3],
    "%extreme%": ["highest", "lowest"],
    "%compare%": ["less than", "greater than"],
    "%mult%": [1,2,3],
    "%rank%": ["first", "last"],
    "%numactions%": [2,3,4],
    "%margin%": [1,2,3],
    "%include%": ["with", "without"]
}

const CARD_ACTIONS:GeneralDict =
{
    // base game
    reroll_forced: { label: "Forced Reroll", desc: "Another Soul <b>must reroll</b> once." },
    add: { label: "Add", desc: "<b>Add %numlow%</b> to every value rolled so far", prob: 2 },
    subtract: { label: "Subtract", desc: "<b>Subtract %numlow%</b> from every value rolled so far", prob: 2 },
    ignore_icon: { label: "Ignore Icon", desc: "<b>Ignore 1 icon</b> from the reward <b>or</b> penalty of this contract.", prob: 0.33 },
    double: { label: "Double", desc: "<b>Double</b> one number already rolled.", prob: 1.5 },
    remove: { label: "Remove", desc: "<b>Remove</b> one number already rolled. (It becomes 0 and actionless.)", prob: 1.5 },
    swap: { label: "Swap", desc: "<b>Swap</b> 1 card from your die with another Soul." },
    disable_special: { label: "Disable Special", desc: "<b>Disable</b> the special modification on the <b>contract</b> (if it has any)" },
    clamp: { label: "Chameleon", desc: "I'm equal to the <b>%rank% number</b> rolled so far." },
    stars: { label: "Star Counter", desc: "I'm equal to <b>2 x number of stars</b> on the contract." },
    reroll_back: { label: "Reroll Return", desc: "On reroll, your previous result is put back into your deck (and thus forgotten)." },

    // expansion
    insta_fail: { label: "Instant Fail", desc: "If another Soul rolls a %numlow% (or lower), the contract instantly <b>fails</b>.", prob: 0.33, sets: ["devilish"] },
    insta_win: { label: "Instant Success", desc: "If another Soul rolls a %numhigh% (or higher), the contract instantly <b>succeeds</b>.", prob: 0.33, sets: ["devilish"] },
    soul_add: { label: "Soul Add", desc: "For every Soul, <b>add %numlow%</b> to every value rolled from now on.", sets: ["devilish"], prob: 1.5 },
    soul_remove: { label: "Soul Subtract", desc: "For every soul, <b>subtract %numlow%</b> from every value rolled from now on.", sets: ["devilish"], prob: 1.5 },
    count_rolls: { label: "Roll Counter", desc: "I'm equal to <b>how many times</b> players have <b>rolled</b> so far.", sets: ["devilish"], prob: 2 },
    no_duplicates: { label: "No Duplicates", desc: "If anybody rolls the <b>same</b> number as me, I'm <b>removed</b>. (I become 0 and actionless.)", sets: ["devilish"], prob: 2 },
    attendance_bonus: { label: "Attendance", desc: "If the Turnout is equal to <b>all players</b>, this card is any number <b>between 1 and 10</b> (you choose).", sets: ["devilish"] },
    die_manipulation: { label: "Die Manipulator", desc: "Pick another Soul. <b>Add or Remove</b> 1 card from their die.", sets: ["devilish"] },
    random_roll: { label: "Reroll Random", desc: "Draw the <b>top card</b> from the deck and pretend you rolled that. Keep it afterward.", sets: ["devilish"] },
    ignore_icon_super: { label: "Ignore Icon+", desc: "<b>Ignore 1 icon</b> from both reward <b>and</b> penalty of this contract.", sets: ["devilish"] },
    contract_switch: { label: "Contract Switch", desc: "If multiple Souls roll the <b>same number</b>, <b>switch</b> the contract for a different one.", sets: ["devilish"], prob: 0.5 },
    insta_win_soft: { label: "Cursed Success", desc: "<b>Instantly succeed</b> the contract, but the reward isn't scaled with Turnout.", sets: ["devilish"], prob: 0.33 },
    insta_fail_soft: { label: "Soft Fail", desc: "<b>Instantly fail</b> the contract, but take no penalty.", sets: ["devilish"], prob: 0.33 },
    number_cond: { label: "Conditional", desc: "Only <b>count this result</b> (at the end) if another roll has the <b>same number</b>.", sets: ["devilish"] },
    reroll_optional: { label: "Maybe Reroll", desc: "Another Soul <b>may reroll</b> once.", sets: ["devilish"] },
    reroll_mega: { label: "Mega Reroll", desc: "Other Souls are allowed to reroll their result, but <b>at most 2 times</b> (for the whole group, this contract).", sets: ["devilish"], prob: 0.5 },
    diebreak: { label: "Diebreak", desc: "Other Souls are allowed to use only a <b>part</b> of their die, but at least 2 cards.", sets: ["devilish"], prob: 0.5 }
}

/*

DEPRECATED: The "Swap Card" penalty/reward. Too much hassle to explain and introduce (in expansions perhaps), too little gain.

*/

const TEMPLATES:GeneralDict =
{
    texture: { frame: 0 },
    gradient: { frame: 1 },
    outline: { frame: 2 },
    texture_wildcard: { frame: 3 },
    contract: { frame: 4 }
}

const MISC:GeneralDict =
{
    card_reward: { frame: 0 },
    card_penalty: { frame: 1 },
    score_reward: { frame: 2 },
    score_penalty: { frame: 3 },
    star: { frame: 4 },
    battle_icon: { frame: 5 },
    forced_icon: { frame: 6 },
    wildcard_icon: { frame: 7 }
}

export 
{
    MISC,
    CONTRACT_DO_WHO,
    CONTRACT_DO_FREQ,
    CONTRACT_DO_MOD,
    CONTRACT_TEST_WHAT,
    CONTRACT_TEST_COMPARE,
    CONTRACT_TEST_NUMBER,
    CONTRACT_SPECIAL,
    DYNAMIC_REPLACEMENTS,
    CARD_ACTIONS,
    TEMPLATES,
    NUMBERS,
    CardType,
    ContractType,
    GeneralDict
}