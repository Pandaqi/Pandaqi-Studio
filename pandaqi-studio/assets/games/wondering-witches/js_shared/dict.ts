/*
    Ingredients
*/
const FIRST_HINT_TYPES = ['Group', 'Negative', 'Effects'];
const INGREDIENTS = {
    Parsley: 0, Sage: 1, Chives: 2, Rosemary: 3, Oregano: 4, 
    Mint: 5, Dill: 6, Basil: 7, Thyme: 8, "Black Pepper": 9
};

// Saved as an integer in the code
// 0 = IGNORE; this ingredient will be skipped and not interacted with, although effects execute
// 1 = OVERACHIEVER; this ingredient is always undergrown (0) or overgrown (n+1)
// 2 = IMPOSTER; this ingredient behaves like a regular ingredient, but it has the "imposter" effect
const DECOY_NAMES = ['Ignore', 'Overachiever', 'Imposter'];

/*
    Events
*/
class Event {
    title: string;
    type: string;
    desc: string;
    prob: number;

    constructor(title: string, desc: string, type: string, prob = 1.0)
    {
        this.title = title;
        this.type = type;
        this.desc = desc;
        this.prob = prob;
    }
}

const EVENTS = {
    "Silence Spell": new Event("Silence Spell", "One of the witches accidentally casts a silence spell! You <strong>can't</strong> communicate anymore about your turns.", "bad", 1.0),

    "Surprise Soup": new Event("Surprise Soup", "On your turn, you may only say an ingredient you don't have yet. If none exists, test a potion or skip your turn.", "bad", 1.0),

    "Drought": new Event("Drought", "A drought makes it impossible to <strong>grow</strong> plants on your turn.", "bad", 0.5),

    "Working Witches": new Event("Working Witches", "Choose any empty field and write a small '2' inside it. This cell can now hold two ingredients at the same time!", "good", 1.5),

    "Fantastical Fire": new Event("Fantastical Fire", "Oh no, a fire started! Until the next potion is tested, everyone must cross out one empty cell at the start of their turn. It's lost forever.", "bad", 0.5),

    "Make a Wish": new Event("Make a Wish", "Change one thing on the board, ignoring all other rules in the game. (Example: add an ingredient you want, cross out a border between two gardens, ...)", "good", 0.25),

    "Rebel Witches": new Event("Rebel Witches", "When you say an ingredient on your turn, everybody has to pick a <em>different</em> ingredient for their own part of your turn (grow or plant). Because they're all rebels.", "neutral", 1.0),

    "The Ungrower": new Event("The Ungrower", "A dark wizard is reversing how nature works! When you <em>grow</em> on your turn, you <strong>remove</strong> a dot from all ingredients in the garden.", "neutral", 0.75),

    "Professor of Patience": new Event("Professor of Patience", "You may only test a potion if the garden is completely full.", "bad", 1.0),

    "Two-for-one": new Event("Two-for-one", "It's a special day for witches! When you plant an ingredient, you must plant <em>two</em> at once.", "neutral", 0.75),

    "Forbidden Fruit": new Event("Forbidden Fruit", "Discuss and pick one ingredient. This one is now forbidden and cannot be planted or grown.", "bad", 1.0),

    "Erase Enchantment": new Event("Erase Enchantment", "A huge eraser looms over the forest---somebody spoke the eraser enchantment! If you place a new ingredient on your turn, you may erase an existing one first.", "good", 1.5),

    "Swapper Sorcery": new Event("Swapper Sorcery", "Everybody swaps their garden with another player. Once you've played a full round, swap back to your own garden again.", "neutral", 1.0),

    "Recipe Change": new Event("Recipe Change", "One of the witches keeps throwing in extra ingredients at the last second! When you test a potion, you may add or remove one ingredient of choice.", "good", 1.0),

    "Starseeds": new Event("Starseeds", "You found the rare Starseed flower. When you test a potion, you may change the number of seeds on two ingredients <em>at will</em>.", "good", 0.5),

    "Rival Runes": new Event("Rival Runes", "A rival witch clan left runes in your gardens. On your turn, draw an invented symbol in an empty cell. These cells cannot be used until this event is removed.", "bad", 0.75),

    "Pattern Potion": new Event("Pattern Potion", "If you currently have a garden with only <em>one</em> ingredient type, you may not change or grow it.", "bad", 1.0),

    "Alpha Witch": new Event("Alpha Witch", "All players count the number of dots they currently have next to ingredients (that aren't crossed out). The one with the highest number becomes the alpha witch: they immediately take two turns. (Then play resumes as normal from their position.)", "neutral", 1.0),

    "Test Tag": new Event("Test Tag", "Discuss and pick one player. They must test a potion on their next turn. If not possible, you lose the game.", "bad", 0.25),

    "Hunch from the Hat": new Event("Hunch from the Hat", "One of the witches has the strange habit to pull amazing ideas from her high hat. The next player to test a potion, may test <em>any</em> potion they want, of at most two ingredients.", "good", 1.0)
};

/*
    Special cells
*/
class SpecialCell {
    frame: any;
    category: any;
    name: any;
    explanation: any;
    constructor(frame: number, category: number, name: string, explanation: string) {
        this.frame = frame;
        this.category = category;
        this.name = name;
        this.explanation = explanation;
    }
}

const SPECIAL_CELLS = {
    // the good ones
    "Efficiency": new SpecialCell(0, 0, 'Efficiency', 'This cell can hold two separate ingredients.'),
    "Versatility": new SpecialCell(1, 0, 'Versatility', 'Use this cell as a single-cell garden. Test the content as often as you want.'),
    "Painter": new SpecialCell(2, 0, 'Painter', 'When used, draw a line anywhere to divide a garden.'),
    "Guesser": new SpecialCell(3, 0, 'Guesser', 'When used, immediately test ANY potion you want for free! However, it must include the ingredient you just planted here.'),

    // the bad ones
    "Low Ceiling": new SpecialCell(4, 1, 'Low Ceiling', 'Whatever is inside may grow at MOST two steps.'),
    "Fertile Ground": new SpecialCell(5, 1, 'Fertile Ground', 'This cell grows TWO steps at once.'),
    "Hard Ground": new SpecialCell(6, 1, 'Hard Ground', 'If you plant something here, SKIP the next turn.'),
    "Black Magic": new SpecialCell(7, 1, 'Black Magic', "The soil is ruined. You cannot use this cell ... until it's your last one remaining"),
};


/*
    Effects
*/
// categories: 
class Effect {
    category: any;
    name: any;
    explanation: any;
    feedback: string;
    directEffect: boolean;
    singular: boolean;
    constructor(category: number, name: string, explanation: string, fb = "", de = false, s = true) {
        this.category = category;
        this.name = name;
        this.explanation = explanation;
        this.feedback = fb;
        this.directEffect = de;
        this.singular = s;
    }

    isPotion() { return this.category == 0; }
    isInvestigative() { return this.category == 1; }
    isAbility() { return this.category == 2; }
}

// because I am STUPID, the old structure (when I made v1 of this game) doesn't have a nice structure
// that's why we also create EFFECT_DICT where we can access effects by key directly
const EFFECTS = {}; 
const EFFECT_DICT = {};

// CHANGE potion (these can be a great obstacle, or you can use these to your advantage)
EFFECTS['ChangeCauldron'] = [
    new Effect(0, "Cutoff", "When this ingredient is encountered, all ingredients after it aren't considered anymore.", "The ingredient was cut off", true),
    new Effect(0, "Spicy", "Raises the number of the ingredient AFTER it by one. (Only during potion evaluation, not permanently.)", "A spicy ingredient was encountered"),
    new Effect(0, "Refreshing", "Lowers the number of the ingredient AFTER it by one. (Only during potion evaluation, not permanently.)", "A refreshing ingredient was encountered"),
    new Effect(0, "Enthusiastic", "When the computer examines a potion, it SKIPS the ingredient after this one.", "Enthusiastic skipped an ingredient", true),
    new Effect(0, "Cleaner", "Removes all effects from the ingredient AFTER itself. (Only during potion evaluation, not permanently.)", "A cleaning ingredient was encountered"),
    new Effect(0, "Fertilizer", "Pretends the next overgrown/undergrown element is actually perfect. (It's not reported and not automatically counted as being wrong.)", "A fertilizer worked its magic", true),
];

// INVESTIGATIVE
EFFECTS['Investigative'] = [
    new Effect(1, "Detective", "Returns the number of a random ingredient in the same potion"),
    new Effect(1, "Liar", "Returns a random number that is NOT within this potion"),
    new Effect(1, "Inspector", "Returns the number of ingredients that have one or multiple effects"),
    new Effect(1, "General", "Returns the total number of effects active within the potion"),
    new Effect(1, "Pessimist", "Returns how many ingredients in this potion are in the WRONG order. (The ingredient before them is not exactly one below their number.)"),
    new Effect(1, "Optimist", "Returns how many ingredients in this potion are in the RIGHT order. (The ingredient before them is exactly one below their number.)"),
    new Effect(1, "Calculator", "Returns the sum of all secret numbers"),
    new Effect(1, "Joker", "Disguises itself as one of the other investigative effects (see the rulebook). Every time you test it, it executes a different effect and gives you the results."),
    new Effect(1, "Revealer", "Returns how many DECOYS are within this potion"),
    new Effect(1, "Blessing", "Returns how many GOOD ingredients are within this potion"),

    new Effect(1, "Scientist", "Returns YES if at least one ingredient in the potion has <em>more than one</em> effect, NO otherwise."),
    new Effect(1, "Hugger", "Returns YES if the ingredient before it has a number that's one higher/lower than its own, NO otherwise."),
    new Effect(1, "Crowdy", "Yells \"It's so crowded in here!\" if it's in a potion with at least three other ingredients", "\"It's so crowded in here!\""),
    new Effect(1, "Brothers", "This ingredient has a related ingredient (their brother). They MUST be in the same potion!", "Found a brother."),
    new Effect(1, "Enemies", "This ingredient has a related ingredient (their enemy). They may NOT be in the same potion!", "Found an enemy."),

    new Effect(1, "Imposter", "Automatically given to imposter decoys, but can be given to regular ingredients as well. You receive the feedback \"An imposter was encountered\".", "An imposter was encountered"),
];

// CHANGE PLAYERS (handicap or special power)
EFFECTS['ChangePlayers'] = [
    
    new Effect(2, "Poison", "You immediately become <em>poisoned</em>. You lose if all players are poisoned.", "You are now <em>Poisoned</em> (player ability)!"),
    
    new Effect(2, "Green Fingers", "You get the <em>green fingers</em> ability. When you grow a garden, grow it 2 steps at once. When you say an ingredient (on your turn), others may choose to do the same.", "You get the ability <em>Green Fingers</em> (player ability)!"),
    
    new Effect(2, "Piggyback", "Take your actions on the board of another player.", 'Oh no, you have become a <em>Piggyback</em> (player ability)!'),
    
    new Effect(2, "Allergies", "You become Allergic to all ingredients within this potion. You may not plant or grow them.", 'Too bad, you just got <em>Allergies</em> (player ability)!'),
    
    new Effect(2, "Distracted", "You become (easily) Distracted. You can’t grow a plant further than 2 steps ( = dots).", 'You become <em>Distracted</em> (player ability)!'),

    new Effect(2, "Genius", "You become a Genius! When testing a potion, change one thing at the last second. (Add/remove an ingredient, or change seeds.)", 'You become a <em>Genius</em> (player ability)'),

    new Effect(2, "Sharer", "You like sharing! You can only say or plant the ingredient you have the least.", "You become a <em>Sharer</em> (player ability)!"),

    new Effect(2, "Minimalist", "You are a minimalist. You can only test potions with one ingredient.", "You become a <em>Minimalist</em> (player ability!"),

    new Effect(2, "Copycat", "Wow, such a copycat. On your turn, don’t do any regular action. Instead, completely copy one active garden from another player to your own board.", "You become a <em>Copycat</em> (player ability.")

];

// these effects are REALLY hard and difficult to decipher/use properly, which means they're only used on the highest difficulty
// (at that difficulty, they are mixed in with the rest)
EFFECTS['Complex'] = [
    new Effect(4, "Resetter", "Resets evaluation. The computer forgets everything and starts again from the NEXT ingredient.", "A reset occurred!", true),
    new Effect(4, "Equalizer", "The secret number of the ingredient AFTER it becomes EQUAL to the number of effects that it has", 'An equalizer was encountered'),

    new Effect(4, "Student", "You become a <em>Student</em> of nature! You may plant any ingredients, even if they are not your <em>specialty</em>.", "You become a <em>Student</em> of nature!"),
    new Effect(4, "Spreader", "You gain the <em>Spreader</em> ability! You may plant ingredients in any garden (not just your own).", 'You gain the <em>Spreader</em> ability!'),

    new Effect(4, "Random", "When this ingredient is evaluated, it determines a random secret number on the spot", 'An ingredient did something Random ...'),

    new Effect(4, "Blender", "Its secret number is increased by the number of GOOD ingredients within the same potion", 'Ingredients were thrown in the Blender'),
    new Effect(4, "Downer", "Its secret number is decreased by the number of DECOYS within the same potion", 'A Downer was encountered'),

    new Effect(4, "Teamplayer", "The secret number of the ingredient BEFORE it is added to its own secret number", 'A teamplayer was present'),
    new Effect(4, "Analyzer", "Reports the DISTANCE between its secret number and its location within the potion. (Example: if it has number 3, but it's at the first spot in the potion, then it returns 3-1=2.", undefined, false),

    new Effect(4, "Odd", "If there is an odd number of ingredients in the potion, it disables itself (temporarily): it becomes an ignore decoy and disables any effects it has't yet executed.", 'An odd ingredient was encountered'),
    new Effect(4, "Even", "If there is an even number of ingredients in the potion, it becomes happy and tells you what it is. If not, it becomes a random result, both to you and other effects.", undefined, false),
    new Effect(4, "Coward", "If this effect is in the first half of the potion, it moves itself to the LAST position in the potion", 'One ingredient was a Coward.', true),
];


// DISCARDED IDEAS
//
// These effects were replaced with decoys that do exactly this:
//  => One that makes an ingredient always report undergrown
//  => One that makes an ingredient always report overgrown
//
// These became useless when I changed the game rules (the range of numbers isn't guaranteed):
//  => One that MUST be in a potion with the number 10
//  => One that MUST be in a potion with the number 1 
//
// Would be a nightmare to code, and is probably too powerful:
//  => One that turns a single "bad/decoy" ingredient into a good one

export {
    FIRST_HINT_TYPES,
    INGREDIENTS,
    DECOY_NAMES,
    EVENTS,
    SPECIAL_CELLS,
    EFFECTS,
    EFFECT_DICT
}