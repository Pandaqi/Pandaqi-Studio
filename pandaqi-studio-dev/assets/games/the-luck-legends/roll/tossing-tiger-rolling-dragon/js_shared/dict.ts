
enum AnimalType
{
    TIGER = "tiger",
    DRAGON = "dragon",
    MANTIS = "mantis",
    CRANE = "crane",
    LEOPARD = "leopard",
    PANDA = "panda",
    MONKEY = "monkey",
    SNAKE = "snake",
    PEACOCK = "peacock",
    BULL = "bull",
    TURTLE = "turtle",
    REDPANDA = "redpanda",
    CHAMELEON = "chameleon",
    HORSE = "horse",
    FROG = "frog",
    ROOSTER = "rooster",
    PARROT = "parrot",
    UNICORN = "unicorn"
}

enum ActionType
{
    CHOICE = "choice",
    AUTO = "auto",
    NONE = "none"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    color?: string,
    dark?: boolean,
    set?: string, // "base" by default
    type?: ActionType, // NONE by default
    strengthless?: boolean,
}

type MovesDictionary = Record<AnimalType,GeneralData>
const MOVES:MovesDictionary =
{
    // base game
    // it has the simplest actions and many without action at all
    [AnimalType.TIGER]: { frame: 0, label: "Tossing Tiger", desc: "<b>Toss</b> me into the air. I land <b>faceup</b>? You win. <b>Facedown</b>? Opponent wins.", type: ActionType.AUTO, strengthless: true, color: "#f48230" },
    [AnimalType.DRAGON]: { frame: 1, label: "Rolling Dragon", desc: "<b>Reroll</b> this battle or an earlier one.", type: ActionType.CHOICE, color: "#e7184c", dark: true },
    [AnimalType.MANTIS]: { frame: 2, label: "Midjab Mantis", desc: "", type: ActionType.NONE, color: "#3db44c", dark: true },
    [AnimalType.CRANE]: { frame: 3, label: "Crouching Crane", desc: "", type: ActionType.NONE, color: "#43d4f5" },
    [AnimalType.MONKEY]: { frame: 4, label: "Megakick Monkey", desc: "<b>Look at</b> both dice from a <b>later battle</b>.", type: ActionType.NONE, color: "#9b6324", dark: true },
    [AnimalType.PANDA]: { frame: 5, label: "Pushing Panda", desc: "All <b>earlier animals</b> of yours are <b>strengths</b> of mine.", type: ActionType.NONE, strengthless: true, color: "#222222", dark: true },
    [AnimalType.TURTLE]: { frame: 6, label: "Trickstomp Turtle", desc: "<b>Disable</b> the action on the opponent's card.", type: ActionType.AUTO, color: "#4362d7", dark: true },
    [AnimalType.LEOPARD]: { frame: 7, label: "Lunging Leopard", desc: "<b>Swap</b> two of your piles (revealed or not).", type: ActionType.CHOICE, color: "#dcbdff" },

    // expansion
    // most of these actions allow manipulating a battle to be about something OTHER than strengths => this allows the base game and expansion animals to interact
    [AnimalType.SNAKE]: { frame: 8, label: "Swinging Snake", desc: "<b>Lost all</b> earlier battles? I always lose. <b>Won all</b> earlier battles? I always win.", set: "zoo", type: ActionType.AUTO, color: "#fee119" },
    [AnimalType.PEACOCK]: { frame: 9, label: "Pirouette Peacock", desc: "If the next battle has <b>no single winner</b>, <b>you are</b> the single winner.", set: "zoo", type: ActionType.AUTO, color: "#f031e6", dark: true },
    [AnimalType.BULL]: { frame: 10, label: "Bashing Bull", desc: "<b>Destroy</b> a card from an earlier battle.", set: "zoo", type: ActionType.CHOICE, color: "#45998f", dark: true },
    [AnimalType.REDPANDA]: { frame: 11, label: "Rearpunch RedPanda", desc: "If my opponent is <b>strong</b> against me, <b>draw</b> one card from the deck <i>OR</i> an earlier battle.", set: "zoo", type: ActionType.CHOICE, color: "#800000", dark: true },
    [AnimalType.CHAMELEON]: { frame: 12, label: "Crabbing Chameleon", desc: "<b>Copy</b> the action from a card in the previous battle.", set: "zoo", type: ActionType.AUTO, color: "#911eb4", dark: true },
    [AnimalType.HORSE]: { frame: 13, label: "Highkick Horse", desc: "If you've rolled all my strengths in earlier battles, I am strong against <b>everyone</b>.", set: "zoo", type: ActionType.AUTO, color: "#fffac7" },
    [AnimalType.UNICORN]: { frame: 14, label: "Undercut Unicorn", desc: "If all your earlier animals are <b>different</b>, add my type as a <b>strength</b> to your later animals.", set: "zoo", type: ActionType.AUTO, color: "#fbbed5" },
    [AnimalType.FROG]: { frame: 15, label: "Feinting Frog", desc: "If anyone rolled me in an <b>earlier battle</b>, I always <b>lose</b>.", set: "zoo", type: ActionType.AUTO, color: "#bfef44" },

    // dawndojo
    // this is always on the rooster, but there's a separate list of all possible texts/content it can have
    [AnimalType.ROOSTER]: { frame: 16, label: "Roaring Rooster", desc: "", set: "dawnDojo", color: "#aaffc2" },

    // fightTogether
    // just has the single "communication" card
    [AnimalType.PARROT]: { frame: 17, label: "Blabbering Bird", desc: "Until the next battle is started, players on my team may freely <b>communicate</b>.", set: "fightTogether", color: "#ffffff" }
}

const DAWN_ACTIONS:Record<string,GeneralData> =
{
    one_less: { desc: "The opponent places <b>1 fewer pile</b>. (You always win against an empty spot.)", type: ActionType.AUTO },
    one_merge: { desc: "Once this war, force the opponent to merge two piles and re-roll. (You always win against an empty spot.)", type: ActionType.CHOICE },
    one_reroll: { desc: "Both players have <b>1 free reroll</b> available for the entire war.", type: ActionType.CHOICE },
    no_winner: { desc: "This war has <b>no overall winner</b>.", type: ActionType.AUTO },
    tied_winner: { desc: "This war is <b>won by both players</b> if it's an overall tie.", type: ActionType.AUTO },
    early_stop: { desc: "The war ends as soon as anyone has <b>lost 2 battles</b>.", type: ActionType.AUTO },
    final_reroll: { desc: "The winner of the <b>final battle</b> has <b>1 free reroll</b> at the end of the war.", type: ActionType.AUTO },
    multi_stage: { desc: "This war moves <b>1 battle at a time</b>. (Start with only 1 battle. Once resolved, players create their next dice, and so forth.)", type: ActionType.AUTO },
    bait_and_switch: { desc: "At war's end, <b>lose a battle</b> on purpose to pretend you <b>won a different one</b>.", type: ActionType.CHOICE },
    strong_type: { desc: "<b>Pick any animal.</b> It's added as a <b>strength</b> to all your animals this war.", type: ActionType.CHOICE },
    weak_type: { desc: "<b>Pick any animal.</b> It's removed as a strength from all animals.", type: ActionType.CHOICE },
    superhero_type: { desc: "<b>Pick any animal.</b> It simply <b>cannot lose</b> its battles.", type: ActionType.CHOICE },
    superweak_type: { desc: "<b>Pick any animal.</b> It has <b>no strengths</b> in this war.", type: ActionType.CHOICE },
    guess: { desc: "Once this war, <b>guess</b> what the opponent will roll before starting a battle. If correct, you win.", type: ActionType.CHOICE },
    flee: { desc: "Both players may purposely <b>lose</b> a battle to <b>remove the bonus</b> for winning the entire war.", type: ActionType.CHOICE },
    no_ties: { desc: "The opponent <b>loses every battle</b> where both players played the <b>same card</b>.", type: ActionType.AUTO },

}

const ROOSTER_CHANGES:Record<string,GeneralData> =
{
    rooster_always_win: { desc: "<b>I always win.</b> But if the opponent rolls this card too, the war <b>instantly ends</b> and <b>they win</b> (overall).", type: ActionType.AUTO },
    rooster_always_lose: { desc: "<b>I always lose.</b> But you can <b>stop</b> the war right now <i>OR</i> <b>remove</b> an earlier battle.", type: ActionType.CHOICE },
    rooster_always_lose_alt: { desc: "<b>I always lose.</b> Take up to 3 unrevealed cards from your dice back into your hand.", type: ActionType.CHOICE },
    rooster_always_win_alt: { desc: "<b>I always win.</b> But my opponent type is removed as a strength from all later cards.", type: ActionType.AUTO },
    rooster_insta_end: { desc: "You may give my pile to your opponent to <b>stop</b> the war right now, declaring <b>no winner</b>.", type: ActionType.CHOICE },
    rooster_concede: { desc: "You may <b>purposely lose</b> this battle to <b>remove the bonus</b> for winning the entire war.", type: ActionType.CHOICE },
    rooster_skip: { desc: "You may <b>retreat</b> from the <b>next battle</b>; skip over it and pretend it's not part of this war.", type: ActionType.CHOICE },
    rooster_change: { desc: "You may <b>purposely lose</b> this battle to change the dice for all later battles.", type: ActionType.CHOICE },
    rooster_disable: { desc: "In all later battles, Roosters are <b>strong</b> against the opponent of this battle.", type: ActionType.AUTO },
    rooster_steal: { desc: "If I appear <b>more than 3 times</b> in previous battles, <b>steal</b> any card from the opponent.", type: ActionType.CHOICE },
    rooster_count: { desc: "<b>Count</b> how often my type appears in earlier battles. If you win this battle, take <b>that many cards</b> from the opponent die.", type: ActionType.AUTO },
    rooster_change_bonus: { desc: "<b>Change the bonus</b> for winning the entire war: either 1, 2, 3 or 4 entire piles.", type: ActionType.CHOICE },
    rooster_pity_type: { desc: "If you <b>lost all earlier</b> battles, pick a <b>strength</b> now; it's added to all your later animals.", type: ActionType.CHOICE },
    rooster_multi_bonus: { desc: "The <b>number of piles</b> that the war's overall winner may grab is <b>multiplied</b> by the number of earlier battles you won.", type: ActionType.AUTO }
}

/*
DEPRECATED (at least for the standard animals):
* CHOICE: "You _may_ give this card to the opponent to restart the entire war." (too slow/cyclic)
* CHOICE: "Pick an upcoming battle. If you guess correctly what the opponent will roll, they lose." => this is fun, but hard to remember during a war, especially if this can happen multiple times at any point
* CHOICE: "You _may_ lose this battle to pretend you won an earlier one." => too similar to a Dawn action, not valuable enough to keep
*/

const MISC:Record<string, GeneralData> =
{
    heading_box: { frame: 0 },
    text_box: { frame: 1 },
    strength_circle: { frame: 2 },
    sun_icon: { frame: 3 }
}

const TEMPLATES:Record<string,GeneralData> =
{
    bamboo: { frame: 0 },
    patterns: { frame: 1 },
    texture: { frame: 2 },
    outline: { frame: 3 },
    spiral: { frame: 4 },
    cherry_blossom: { frame: 5 }
}

export 
{
    MISC,
    TEMPLATES,
    MOVES,
    DAWN_ACTIONS,
    ROOSTER_CHANGES,
    AnimalType,
    MovesDictionary
}