
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
    ROOSTER = "rooster",
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
    type?: ActionType, // NONE by default
}

const MOVES:Record<AnimalType,GeneralData> =
{
    // base game
    // it has the simplest actions and many without action at all
    [AnimalType.TIGER]: { frame: 0, label: "Tossing Tiger", desc: "<b>Toss</b> this card into the air. It lands <b>faceup</b>? You win. <b>Facedown</b>? The opponent wins.", type: ActionType.AUTO },
    [AnimalType.DRAGON]: { frame: 1, label: "Rolling Dragon", desc: "<b>Reroll</b> this battle or an earlier one.", type: ActionType.CHOICE },
    [AnimalType.MANTIS]: { frame: 2, label: "Midjab Mantis", desc: "", type: ActionType.NONE },
    [AnimalType.CRANE]: { frame: 3, label: "Crouching Crane", desc: "", type: ActionType.NONE },
    [AnimalType.MONKEY]: { frame: 4, label: "Megakick Monkey", desc: "", type: ActionType.NONE },
    [AnimalType.PANDA]: { frame: 5, label: "Pushing Panda", desc: "", type: ActionType.NONE },
    [AnimalType.TURTLE]: { frame: 6, label: "Trickfeint Turtle", desc: "<b>Disables</b> the action on the opponent's card.", type: ActionType.AUTO },
    [AnimalType.LEOPARD]: { frame: 7, label: "Lunging Leopard", desc: "<b>Swap</b> two of your piles (revealed or not).", type: ActionType.CHOICE },

    // expansion
    // most of these actions allow manipulating a battle to be about something OTHER than strengths => this allows the base game and expansion animals to interact
    [AnimalType.SNAKE]: { frame: 8, label: "Swinging Snake", desc: "" },
    [AnimalType.PEACOCK]: { frame: 9, label: "Pirouette Peacock", desc: "" },
    [AnimalType.BULL]: { frame: 10, label: "Bashing Bull", desc: "" },
    [AnimalType.REDPANDA]: { frame: 11, label: "Rearpunch RedPanda", desc: "" },
    [AnimalType.CHAMELEON]: { frame: 12, label: "Crabbing Chameleon", desc: "<b>Copies</b> the action on your previous card.", type: ActionType.AUTO }, // @TODO: change to "your previous card OR the opponent's card (in this battle)"??
    [AnimalType.HORSE]: { frame: 13, label: "Highkick Horse", desc: "" },
    [AnimalType.UNICORN]: { frame: 14, label: "Undercut Unicorn", desc: "" },

    // dawndojo
    // this is always on the rooster, but there's a separate list of all possible texts/content it can have
    [AnimalType.ROOSTER]: { frame: 14, label: "Roaring Rooster", desc: "" },
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
    bait_and_switch: { desc: "Once this war, <b>lose a battle</b> on purpose to pretend you <b>won a different one</b>.", type: ActionType.CHOICE },
    strong_type: { desc: "<b>Pick any animal.</b> It's added as a <b>strength</b> to all your animals this war.", type: ActionType.CHOICE },
    weak_type: { desc: "<b>Pick any animal.</b> It's removed as a strength from all animals.", type: ActionType.CHOICE },
    superhero_type: { desc: "<b>Pick any animal.</b> It simply <b>cannot lose</b> its battles.", type: ActionType.CHOICE },
    superweak_type: { desc: "<b>Pick any animal.</b> It has <b>no strengths</b> in this war.", type: ActionType.CHOICE },
    guess: { desc: "Once this war, <b>guess</b> what the opponent will roll before starting a battle. If correct, you win.", type: ActionType.CHOICE },
    flee: { desc: "Both players may purposely <b>lose</b> a battle to <b>remove the bonus</b> for winning the entire war.", type: ActionType.CHOICE },
    no_ties: { desc: "The opponent <b>loses every battle</b> where both players played the <b>same card</b>.", type: ActionType.AUTO },

    rooster_always_win: { desc: "<i>Rooster Change:</i> <b>Always wins.</b> But if the opponent rolls this card too, the war <b>instantly ends</b> and <b>they win</b> (overall).", type: ActionType.AUTO },
    rooster_always_lose: { desc: "<i>Rooster Change:</i> <b>Always loses.</b> But you can <b>stop</b> the war right now <i>OR</i> <b>remove</b> an earlier battle.", type: ActionType.CHOICE },
    rooster_insta_end: { desc: "<i>Rooster Change:</i> You may give this pile to your opponent to <b>stop</b> the war right now, declaring <b>no winner</b>.", type: ActionType.CHOICE },
    rooster_concede: { desc: "<i>Rooster Change:</i> You may <b>purposely lose</b> this battle to <b>remove the bonus</b> for winning the entire war.", type: ActionType.CHOICE },
    rooster_skip: { desc: "<i>Rooster Change:</i> You may <b>retreat</b> from the <b>next battle</b>; skip over it and pretend it's not part of this war.", type: ActionType.CHOICE },
    rooster_change: { desc: "<i>Rooster Change:</i> You may <b>purposely lose</b> this battle to change the dice for all later battles.", type: ActionType.CHOICE },
    rooster_disable: { desc: "<i>Rooster Change:</i> In all later battles, Roosters are <b>strong</b> against the opponent of this battle.", type: ActionType.AUTO }
}


/*

@IDEA (YES THIS IS IMPORTANT WHY DIDN'T I DO THIS EARLIER): The order matters. Battles, results and special actions from _earlier_ in the war matter. 
* "If the next battle has no single winner, you are the single winner."
* "If you've lost 2 earlier battles, I always lose. If you've won 2 earlier battles, I always win."
* "If you rolled me in the previous battle too, I always lose."
* "If you rolled 3 different animals in earlier battles, all cards of my type get an extra strength of your choosing."
    * Or more generic: "If all animals rolled by you (before me) are different, I always win."
* "If I appear more than X times in this war, steal any facedown card from the opponent."
* "If you've rolled all my strengths in earlier battles, I am strong against <b>everyone</b>."
* "All previously rolled animals of yours are strengths of mine." (Starts with 0 strengths = special case)
* DRAW: "If the opponent didn't roll a strength of mine, draw one card from the deck OR the other pile in this battle."
* DESTROY+CHOICE: "Permanently destroy a card from an earlier battle."

* CHOICE: "If you lost all earlier battles (and are not the first battle), add this card as a strength to all later cards."
* AUTO: "Count the number of X that appear in earlier battles. If you win this battle, you may take _that many_ cards from the opponent die."
* CHOICE: "Always loses. Take up to 3 unrevealed cards from your dice back into your hand."
* "Always wins. But its opponent is removed as a strength from all later cards."
* CHOICE: "Change the bonus for winning the entire war: either 0, 2, 3 or 4 entire piles."
    * Can be made AUTO: "The number of piles that the overall winner (of the war) may grab is <b>multiplied</b> by the number of earlier battles."

We might need more actions that can DRAW from the deck or permanently DISCARD/DESTROY stuff?



DEPRECATED:
* CHOICE: "You _may_ give this card to the opponent to restart the entire war." (too slow/cyclic)
* CHOICE: "Pick an upcoming battle. If you guess correctly what the opponent will roll, they lose." => this is fun, but hard to remember during a war, especially if this can happen multiple times at any point
* CHOICE: "You _may_ lose this battle to pretend you won an earlier one." => too similar to a Dawn action, not valuable enough to keep

*/

const MISC:Record<string, GeneralData> =
{

}

export 
{
    MISC,
    MOVES,
    DAWN_ACTIONS,
    AnimalType
}