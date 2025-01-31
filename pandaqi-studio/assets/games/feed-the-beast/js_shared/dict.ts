
enum MaterialType
{
    VICTIM,
    RECIPE,
    FOOD,
    BEAST
}

enum RecipeRewardType
{
    TEXT,
    FOOD
}

type SubRecipe = string[]
type RecipeList = SubRecipe[]

interface RecipeReward
{
    type: RecipeRewardType,
    desc?: string,
    food?: RecipeList
}

interface Recipe
{
    cost: RecipeList,
    reward: RecipeReward
}

interface StateData
{
    labels: { on: string, off: string },
    desc: string
}

interface GeneralData
{
    frame?: number,
    col?: string,
    tier?: number, // default = 0
    prob?: number,
    freq?: number,
    value?: number,
    set?: string,
    desc?: string,
    label?: string,
    dynamic?: boolean,

    min?: number,
    max?: number

    // monster properties
    rule?: string,
    state?: StateData,
    menu?: Recipe,
    fury?: string,
    fail?: string,
}

const FOOD:Record<string, GeneralData> = 
{
    bread: { frame: 0, col: "#9B6803", tier: 0, value: 1 },
    fish: { frame: 1, col: "#3FB488", tier: 0, value: 1 },
    mushroom: { frame: 2, col: "#BD362F", tier: 0, value: 1 },
    berries: { frame: 3, col: "#2F7EBD", tier: 0, value: 1 },
    apple: { frame: 4, col: "#7CC96D", tier: 0, value: 1 },

    lamb: { frame: 5, col: "#787878", tier: 1, value: 2 },
    pie: { frame: 6, col: "#493EFF", tier: 1, value: 2 },
    candy: { frame: 7, col: "#CB177C", tier: 1, value: 2 },

    nectar: { frame: 8, col: "#8922DD", tier: 2, value: 3 },
    human: { frame: 9, col: "#C3A900", tier: 2, value: 3 },
}

// Set = baseBeasts or advancedBeasts
// Tier = a general indication of how difficult it is to understand/play
// I try to differentiate the monster TYPES per tier (flying, land, sea, other)

// TIER 0
// -> Dragon, Unicorn, Gnome, Loch Ness, Griffin, Bigfoot
// -> One-liner rules, some bad, some bonus.
// -> Only the second state matters.

// TIER 1
// -> Phoenix, Kraken, Yeti, Werewolf, Sphinx, Ogre
// -> Slightly longer or harder rules, but still focused on simple powers
// -> Both states matter.

// TIER 2
// -> Pegasus, Leviathan, Cyclops, Cerberus, Basilisk, Minotaur
// -> Their rule modifies setup, gameplay or win condition
// -> Their menu and state are simpler, can interplay
// -> Some have a FURY

// TIER 3
// -> Ghost, Golem, Hydra, Goblin, Spirit, Demon
// -> They are _really_ restrictive or do _really_ chaotic stuff
// -> Rule and menu can be anything, mostly unique
// -> They have FURY and/or FAIL

const BEASTS:Record<string, GeneralData> =
{
    dragon: 
    { 
        frame: 0, 
        label: "Dragon",
        tier: 0,
        set: "baseBeasts",

        rule: "If <i>3 players in a row</i> pay me the <b>wrong food</b>, I <b>reset</b> and start <b>Flying</b>.",
        state:
        { 
            labels: { on: "Grounded", off: "Flying" },
            desc: "If <b>Flying</b>, I <b>don't reset</b>."
        },
        menu: 
        {
            cost: [["lamb"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Add</b> a second <i>Menu</i>. (It goes away on the next reset.)"
            }
        }
    },

    kraken: 
    { 
        frame: 1, 
        label: "Kraken",
        tier: 1,
        set: "baseBeasts",

        rule: "If your turn leads me to have <i>all foods of one Tier</i>, <b>you discard</b> 1 token while <b>everyone else draws</b> 1 token of that Tier.",
        state:
        { 
            labels: { on: "Swimming", off: "Attacking" },
            desc: "If <b>Swimming</b>, you can pay any recipe that contains Fish <b>twice</b> (in one turn).\n\nIf <b>Attacking</b>, you <b>can't play Fish</b> at all."
        },
        menu: 
        {
            // the intent here is to allow getting more fish tokens easily, as they are obviously a more valuable resource to the Kraken
            cost: [["bread", "bread"], ["apple", "apple"], ["mushroom", "berries"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Draw</b> 1 Fish token <i>or</i> <b>change State</b>."
            }
        }
    },
    
    phoenix: 
    { 
        frame: 2, 
        label: "Phoenix",
        tier: 1,
        set: "baseBeasts",

        rule: "I <b>reset</b> faster: when I have 6 food on me <i>or</i> 3 food of the same type.",
        state:
        { 
            labels: { on: "Regular", off: "On Fire" },
            desc: "If <b>Regular</b>, nobody may play <i>wrong food</i> ( = skip your turn).\n\nIf <b>On Fire</b>, everyone may <i>play 2 food</i> on their turn."
        },
        menu: 
        {
            cost: [["lamb"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Play 1 more</b> food token for <b>any reward</b> on the current Menu card."
            }
        }
    },
    
    yeti: 
    { 
        frame: 3, 
        label: "Yeti",
        tier: 1,
        set: "baseBeasts",

        rule: "If I store <i>3(+) food of the same type</i>, feed me <b>twice</b> on your turn.",
        state:
        { 
            labels: { on: "Hibernating", off: "Roaming" },
            // the idea is that Yeti "comes to get his own food" if he's roaming, hence you lose a random token
            desc: "If <b>Hibernating</b>, you <b>can't</b> pay my personal Menu.\n\nIf <b>Roaming</b>, pay me <b>random</b> food on your turn."
        },
        menu: 
        {
            cost: [["nectar"], ["pie", "pie"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Reset</b> me. Then <b>place 2</b> tokens on me. Other players <b>must</b> play one of those types (if possible) until the next reset."
            }
        }
    },

    minotaur: 
    { 
        frame: 4, 
        label: "Minotaur",
        tier: 2,
        set: "advancedBeasts",

        fury: "<b>Downgrade</b> one of your tokens. If not possible, <b>draw 2</b> Tier 1 foods.",
        fail: "If I have <b>5 Maze Tokens</b>, I escape the maze and win.",
        rule: "During setup, <b>pick two Tier 1 foods</b>: they are now <i>considered Tier 2</i>.\n\nAlso make Human the <b>only</b> Tier 3 food.",
        state:
        { 
            labels: { on: "Escaping", off: "Charging" },
            desc: "If <b>Escaping</b>, place a random food token to the side every time I <b>reset</b>: a <i>Maze Token</i>.\n\nIf <b>Charging</b>, I reset as soon as someone pays the <i>wrong food</i>."
        },
        menu: 
        {
            // used to be HUMAN
            cost: [["bread", "bread"], ["candy", "candy"], ["human"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Remove</b> 3 Maze Tokens. Give each one to a player (which can be yourself)."
            }
        } 
    },
    
    werewolf: 
    { 
        frame: 5, 
        label: "Werewolf",
        tier: 1,
        set: "baseBeasts",

        rule: "On your turn, you may <b>downgrade</b> 1 food token (to any token of a lower Tier).",
        state:
        { 
            labels: { on: "Man", off: "Wolf" },
            desc: "If <b>Man</b>, I <b>won't</b> eat any food <i>above</i> Tier 1.\n\nIf <b>Wolf</b>, I <b>only</b> eat food <i>above</i> Tier 1."
        },
        menu: 
        {
            // used to be HUMAN
            cost: [["bread", "berries"], ["lamb"], ["human"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Upgrade</b> or <b>downgrade</b> at most 3 tokens."
            }
        }

    },
    
    basilisk: 
    {
        frame: 6, 
        label: "Basilisk",
        tier: 2,
        set: "advancedBeasts",

        // this is very harsh, so use other rules to limit number of wrong food
        fury: "You are turned into a Statue and must <b>skip 2 turns</b>.",
        fail: "If <b>all</b> players are currently a <i>Statue</i>, I win.",
        rule: "During gameplay, the food(s) played <i>most often</i> are considered <b>wrong</b>.\n\nhe food(s) played <i>least often</i> are <b>never</b> wrong. (If not on Menu, they just do nothing.)",
        state:
        { 
            labels: { on: "Slithering", off: "Frozen" },
            desc: "If <b>Slithering</b>, <i>steal</i> 1 token from another player after your turn.\n\nIf <b>Frozen</b>, I <i>don't reset</i> and <i>don't switch Menu</i>."
        },
        menu: 
        {
            cost: [["lamb", "pie", "candy"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Discard</b> 3 tokens that would currently be considered <b>wrong</b>."
            }
        } 
    },
    
    griffin: 
    { 
        frame: 7, 
        label: "Griffin",
        tier: 0,
        set: "baseBeasts",

        rule: "Higher Tier foods only <b>act as wildcards</b> (for lower tiers) if I <i>already have one of that type</i>.",
        state:
        { 
            labels: { on: "Guarding", off: "Chasing" },
            desc: "If <b>Guarding</b>, I can store <b>15 tokens</b> (before I reset).\n\nIf <b>Chasing</b>, I can only store <b>5 tokens</b>."
        },
        menu: 
        {
            cost: [["mushroom", "fish", "berries"], ["bread", "apple"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Draw</b> a Tier 2 food."
            }
        }
    },
    
    unicorn: 
    { 
        frame: 8, 
        label: "Unicorn",
        tier: 0,
        set: "baseBeasts",

        rule: "Whenever I <b>reset</b>, everyone draws 1 food token of <b>any</b> type (even higher tiers).",
        state:
        { 
            labels: { on: "Regular", off: "Magic" },
            desc: "If <b>Magic</b>, paying the wrong food has <i>no penalty</i>."
        },
        menu: 
        {
            cost: [["pie"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Switch</b> the Menu card."
            }
        }
    },


    hydra: 
    { 
        frame: 9, 
        label: "Hydra",
        tier: 3,
        set: "advancedBeasts",

        fury: "<b>Draw 2 tokens</b> of the type you just played.",
        fail: "When I have <b>10 Head Tokens</b>, I win.",
        rule: "During setup, you start with <b>only 3 Tier 1 food</b> (of the same type).\n\nDuring gameplay, whenever you <b>pay Tier 1 food</b>, you must <b>draw 2 more</b> from the supply.",
        state:
        { 
            labels: { on: "Attacking", off: "Regrowing" },
            desc: "When I switch to <b>Regrowing</b>, place any food token off to the side: a <i>Head Token</i>. My <b>rule doesn't apply</b> in this Regrowing state."
        },
        menu: 
        {
            cost: [["bread", "bread"], ["apple", "apple"], ["berries", "berries"], ["lamb", "lamb"], ["pie", "pie"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Draw</b> back 1 token of the type you paid. Also <b>change State</b>."
            }
        }
    }, 

    sphinx: 
    { 
        frame: 10, 
        label: "Sphinx",
        tier: 1,
        set: "baseBeasts",

        rule: "<b>I don't accept wrong food normally.</b> Instead, when you pay a <i>correct recipe</i>, you may also <i>slip in 1 extra wrong food</i>.",
        state:
        { 
            labels: { on: "Asking", off: "Answering" },
            desc: "When my State switches to <b>Asking</b>, reset me.\n\nWhen my State switches to <b>Answering</b>, the active player gives all my food back to the players. "
        },
        menu: 
        {
            cost: [["mushroom"], ["apple"], ["fish"]],
            reward: { 
                type: RecipeRewardType.FOOD,
                food: [["bread"], ["berries"], ["bread", "lamb"]]
            }
        }
    },
    
    ogre: 
    { 
        frame: 11, 
        label: "Ogre",
        tier: 1,
        set: "baseBeasts",

        // used to be HUMAN
        rule: "During setup, all players also get 1 <b>Human</b> and 2 <b>Lamb</b> tokens.",
        state:
        { 
            labels: { on: "Eating", off: "Punching" },
            desc: "If <b>Eating</b>, all Tier 1 food can be paid <i>without penalty</i>.\n\nIf <b>Punching</b>, anybody who pays wrong food has to <b>skip a turn</b> <i>and</i> <b>draw</b> a new token."
        },
        menu: 
        {
            // used to be HUMAN
            cost: [["human"], ["lamb", "lamb"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "You may <b>re-pay</b> this Menu <i>however often you want</i> in a single turn."
            }
        }
    },
    
    gnome: 
    { 
        frame: 12,
        label: "Gnome",
        tier: 0,
        set: "baseBeasts",

        rule: "If your turn leads me to have <b>3(+) food of one type</b>, <b>upgrade</b> 2 food tokens.",
        state:
        { 
            labels: { on: "Aboveground", off: "Underground" },
            desc: "If <b>Underground</b>, you can <b>pay me anything</b> but get <i>no reward or penalty</i>.\n\nWhen I reset, I go back to <b>Aboveground</b>."
        },
        menu: 
        {
            cost: [["candy", "candy"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Discard</b> 4 food tokens."
            }
        }
    },

    cyclops: 
    { 
        frame: 13, 
        label: "Cyclops",
        tier: 2,
        set: "advancedBeasts",

        fury: "You <b>lose all food</b> of your <i>highest Tier</i>, unless that is Tier 1.",
        // the idea is that the cyclops only has one eye and can't see this option
        rule: "Whenever the <i>Menu changes</i>, the active player picks <i>one recipe</i> on it. It's considered <b>wrong</b> anyway.",
        state:
        { 
            labels: { on: "Eye Open", off: "Eye Shut" },
            desc: "If <b>Eye Shut</b>, you must pay your tokens <i>facedown</i> and may <b>lie</b>. Other players may <i>challenge</i> you, and if they're right about lying, draw 4 tokens as penalty."
        },
        menu: 
        {
            // used to be HUMAN
            cost: [["human"], ["lamb", "nectar"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Switch</b> the Menu card and <i>pick one recipe</i>. It is the <b>only</b> one that's <i>not wrong</i>."
            }
        }
    },

    bigfoot: 
    { 
        frame: 14, 
        label: "Bigfoot",
        tier: 0,
        set: "baseBeasts",

        rule: "Always pay the <b>same food</b> as the <b>player before you</b> (if possible)",
        state:
        { 
            labels: { on: "Still", off: "Walking" },
            desc: "If <b>Walking</b>, my rule flips around: you <b>can't</b> pay the same food as the player before you."
        },
        menu: 
        {
            cost: [["lamb", "lamb"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Pick a food.</b> Give <b>all</b> your tokens of that type to <i>other players</i>."
            }
        }
    },

    leviathan: 
    { 
        frame: 15, 
        label: "Leviathan",
        tier: 2,
        set: "advancedBeasts",

        fury: "<b>Draw 2 tokens</b> of a food that is <i>currently wrong</i>.",
        rule: "You <b>win</b> the game if all food tokens you have <b>are of types played</b>. (If tied, continue playing.)\n\nIf you <b>run out</b> of tokens, draw 5 new Tier 1 tokens.",
        state:
        { 
            labels: { on: "Waiting", off: "Wailing" },
            desc: "If <b>Waiting</b>, if the previous player paid wrong food, you may take your turn <i>twice</i>.\n\nIf <b>Wailing</b>, I can store <i>only 4 tokens</i>."
        },
        menu: 
        {
            cost: [["fish", "fish", "fish"], ["nectar"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Give</b> all other players a token of choice (from <i>supply</i>)."
            }
        }
    },

    golem: 
    { 
        frame: 16, 
        label: "Golem",
        tier: 3,
        set: "advancedBeasts",

        fury: "You must <b>pay my menu</b> this turn or the next (if possible).",
        fail: "When the <b>supply</b> of all tokens in a Tier <b>runs out</b>, I win.",
        rule: "If possible, you must pay a food token that <b>hasn't been played</b> already. <b>No food</b> may appear <b>more than 3 times</b> on me.\n\nWhen I <b>reset</b>, my State changes too.",
        state:
        { 
            labels: { on: "Sculpting", off: "Hardening" },
            desc: "If <b>Sculpting</b>, you may <i>change the Menu</i> every turn (for free).\n\nIf <b>Hardening</b>, the Menu and food stored <b>can't change</b>. (Food played is immediately discarded.)"
        },
        menu: 
        {
            cost: [["apple", "apple", "apple"], ["lamb", "lamb"], ["pie", "pie"], ["candy", "candy"], ["nectar"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "If you paid <i>multiple tokens</i>, <b>draw</b> any Tier 1 food. Otherwise, you get nothing."
            }
        }
    },
    
    pegasus: 
    { 
        frame: 17, 
        label: "Pegasus",
        tier: 2,
        set: "advancedBeasts",

        fury: "<b>Draw</b> 2 Tier 1 tokens. Direction of play <b>reverses</b>.", 
        rule: "During setup, players <b>choose</b> their Tier 1 tokens (one by one, clockwise turns).\n\nWhen upgrading food, you upgrade to a <b>random</b> one of the next tier.",
        state:
        { 
            labels: { on: "Prancing", off: "Soaring" },
            desc: "If <b>Soaring</b>, tell the <i>player after you</i> what they should play. They may only <b>ignore</b> the request if <i>I'm empty</i> or they <i>pay my personal Menu</i>."
        },
        menu: 
        {
            cost: [["pie"], ["candy"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "All other players <b>draw</b> 1 food token from <i>me</i>. (Clockwise turns, starting from you.)"
            }
        }
    },
    
    loch_ness: 
    { 
        frame: 18, 
        label: "Nessie",
        tier: 0,
        set: "baseBeasts",

        rule: "Whenever I <b>change State</b>, everyone may <b>swap 2 food tokens</b>.",
        state:
        { 
            labels: { on: "Underwater", off: "Surfaced" },
            desc: "If <b>Surfaced</b>, you <b>can't</b> give me food <i>already played</i>."
        },
        menu: 
        {
            cost: [["nectar"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Discard</b> 2 tokens. I go <b>Underwater</b> and never change State again."
            }
        }
    },
    
    ghost: 
    { 
        frame: 19, 
        label: "Ghost", 
        tier: 3,
        set: "advancedBeasts",

        fury: "I haunt you! <i>Until you play valid food,</i> <b>draw</b> a token at the start of each turn.",
        fail: "If I store <b>more than 25 tokens</b>, I win.",
        rule: "<b>I never reset.</b> You can always pay <i>any Tier 2 token</i> to discard 2 tokens from me.\n\nOr you can pay <i>any Tier 3 token</i> to discard 3 tokens from me and give 3 to other players.",
        state:
        { 
            labels: { on: "Haunting", off: "Being Dead" },
            desc: "If <b>Being Dead</b>, playing wrong food has <i>no penalty</i>, but I also <i>can't switch</i> to another beast."
        },
        menu: 
        {
            cost: [["lamb", "pie", "candy"], ["nectar", "nectar"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Switch</b> to a completely different beast! (My state and food are lost.)"
            }
        }
    },

    goblin: 
    { 
        frame: 20, 
        label: "Goblin",
        tier: 3,
        set: "advancedBeasts",

        fury: "Either <b>draw</b> 1 token <i>or</i> <b>change State</b> at the cost of skipping next turn.",
        fail: "If I hold <b>all</b> possible food types, I win.",
        rule: "My maximum <b>storage</b> is equal to the <b>twice the number of unique food</b> types on me.",
        state:
        { 
            labels: { on: "Spending", off: "Stealing" },
            desc: "If <b>Spending</b>, any food from players with <i>more</i> than 5 tokens is <i>wrong</i>.\n\nIf <b>Stealing</b>, any food from players with <i>fewer</i> than 5 tokens is <i>wrong</i>."
        },
        menu: 
        {
            cost: [["mushroom", "mushroom"], ["fish", "fish"], ["apple", "apple", "apple"]],
            reward: { 
                type: RecipeRewardType.FOOD,
                food: [["bread", "berries", "mushroom", "lamb"], ["apple"]]
            }
        }
    },
    
    spirit: 
    { 
        frame: 21, 
        label: "Spirit",
        tier: 3,
        set: "advancedBeasts",

        fury: "<b>Draw</b> 2 tokens from <i>me</i>.",
        fail: "If I have <b>no food on me</b>, I win.",
        rule: "During setup, <b>start with 5 tokens</b> already one me. When I <b>reset</b>, only discard <i>half</i> my food.\n\n The food in player's hands is <b>facedown</b> (secret) the entire game.",
        state:
        { 
            labels: { on: "Protecting", off: "Destroying" },
            desc: "If <b>Destroying</b>, you actually discard a <b>token from me</b> to do its action (instead of paying from your own food)."
        },
        menu: 
        {
            cost: [["bread"], ["berries"], ["pie"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Change State</b> to anything. Tell another player what token to play next turn (if they have it)."
            }
        }
    
    },
    
    cerberus: 
    { 
        frame: 22, 
        label: "Cerberus",
        tier: 2,
        set: "advancedBeasts",

        fury: "<b>Draw</b> 2 more tokens of the <i>type you just paid</i>.", 
        rule: "I can <b>store 14 tokens</b> before needing a reset.\n\nIf you can pay <b>all recipes</b> on a Menu card, you may do so in a single turn, but only take <i>1 of its actions</i>.",
        state:
        { 
            labels: { on: "Barking", off: "Biting" },
            desc: "If <b>Barking</b>, you can only play a <i>type already on me</i> (unless I'm empty).\n\nIf <b>Biting</b>, <i>remove 2 tokens</i> from me after every turn."
        },
        menu: 
        {
            cost: [["nectar"], ["candy"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Pay all</b> recipes on the Menu card <i>and</i> take <b>all actions</b>."
            }
        }
    },

    // this is probably the hardest beast of them all, maybe even a tier of its own
    demon: 
    { 
        frame: 23, 
        label: "Demon", 
        tier: 3, 
        set: "advancedBeasts",

        fury: "Draw <b>all food played</b>.", 
        fail: "If <b>nobody</b> has paid me <b>correct food</b> for an entire round, I win.",
        rule: "<b>Play without Menu market.</b> When I <i>reset</i>, simply draw the top card of the deck.\n\nHigher tier foods <b>don't count as wildcards</b> (for lower tier foods).",
        state:
        { 
            labels: { on: "Bullying", off: "Pestering" },
            desc: "If <b>Bullying</b>, only the <i>first</i> option of each Menu correct.\n\nIf <b>Pestering</b>, only the <i>last</i> option of each Menu is correct."
        },
        menu: 
        {
            cost: [["mushroom"], ["mushroom", "pie"], ["mushroom", "pie", "nectar"]],
            reward: { 
                type: RecipeRewardType.TEXT,
                desc: "<b>Swap</b> at most 4 tokens for others from <b>any origin</b> (<i>supply, other players, or me</i>)."
            }
        }
    
    }
}

const VICTIMS:Record<string, GeneralData> =
{
    princess: { frame: 0, label: "Princess", desc: "Once you also have the Prince, <b>discard 4 tokens</b>.", freq: 2 },
    prince: { frame: 1, label: "Prince", desc: "Once you also have the Princess, <b>discard 4 tokens</b>.", freq: 2 },
    troll: { frame: 2, label: "Troll", desc: "Higher tier foods are <b>not</b> wildcards for you and one other player.", freq: 2 },
    snowman: { frame: 3, label: "Snowman", desc: "Every turn, you may <b>swap</b> 1 token for another of the same Tier.", freq: 1 },
    dog: { frame: 4, label: "Dog", desc: "Whenever the beast <b>changes state</b>, you may <b>discard</b> 1 token (unless it's your last one).", freq: 1 },
    cat: { frame: 5, label: "Cat", desc: "Whenever the beast <b>resets</b>, the next <b>turn is yours</b>.", freq: 1 },
    grandfather: { frame: 6, label: "Grandpa", desc: "When anybody else frees a victim, <b>you</b> choose <b>which one</b> they get.", freq: 1 },
    grandmother: { frame: 7, label: "Grandma", desc: "When you free a victim, instead <b>steal</b> or <b>discard</b> one from another player.", freq: 1 },
    elf: { frame: 8, label: "Elf", desc: "You have a personal recipe (which only you can use): pay %food% to <b>%reward%</b>.", dynamic: true, freq: 7 },
    sorcerer: { frame: 9, label: "Wizard", desc: "You can pay the beast's Menu <b>twice</b> in one turn.", freq: 1 },
    witch: { frame: 10, label: "Witch", desc: "Victims <b>aren't freed</b> anymore upon <b>reset</b>. You are the only exception to this.", freq: 1 },
    donkey: { frame: 11, label: "Donkey", desc: "Turn the victims <b>facedown</b> and shuffle them. (Freeing one is now a blind action.)", freq: 1 },
    robot_doll: { frame: 12, label: "Robot", desc: "You get <b>no penalty</b> for playing wrong food, but only if you have <b>3 tokens</b> or more.", freq: 2 },
    little_baby: { frame: 13, label: "Doll", desc: "You can use a single token of another player to pay for a recipe.", freq: 1 },
    teddy_bear: { frame: 14, label: "Teddy Bear", desc: "Once this game, you can use three tokens of the same type as a wildcard for any other type.", freq: 1 },
    bard: { frame: 15, label: "Bard", desc: "When <b>acquiring tokens</b>, you may take them from <b>anywhere</b> (supply, beast, or other player).", freq: 1 }
}

const ACTIONS:Record<string, GeneralData> =
{
    // related to recipes / menus
    recipe_switch: { desc: "<b>Switch</b> the Menu.", value: 1.33, prob: 6.0, min: 8 },
    empty_beast: { desc: "<b>Empty</b> the beast.", value: 1.75, prob: 0.33, max: 1 },
    recipe_switch_and_empty: { desc: "<b>Reset</b> the beast.", value: 2.0, prob: 1.75 },
    recipe_study: { desc: "<b>Study</b> the top 6 cards of the Menu deck; return them in any order.", value: 2.0 },
    recipe_market: { desc: "<b>Replace</b> the market. Then <b>Switch</b> Menu.", value: 2.5, prob: 1.5 },
    // recipe_pick: { desc: "<b>Switch</b> the Menu to <b>any</b> card inside the deck.", value: 3.0 }, => with how easily the menu may switch, this just isn't worth it

    // related to tokens
    swap_token: { desc: "<b>Swap</b> 1 food with supply, player or beast.", value: 1.0, prob: 2.0 },
    //upgrade_token: { desc: "<b>Upgrade</b> 2 food OR <b>draw</b> 1 of the <b>highest Tier</b>.", value: 1.0, prob: 3.5 },
    upgrade_token_super: { desc: "<b>Upgrade</b> 3 food to the highest tier.", value: 3.0, prob: 0.66, max: 1 },
    steal_token: { desc: "<b>Steal</b> 2 food from other players.", value: 2.0, prob: 0.5, max: 1 },
    token_hide: { desc: "<b>Hide</b> your food (flip them facedown).", value: 2.5, prob: 0.5, max: 1 },

    // related to playing / taking your turn
    // play_wrong: { desc: "Play a wrong food (<b>without</b> taking its penalty).", value: 1.25, prob: 1.0 },
    discard_token_restricted_1: { desc: "<b>Play</b> another food that has akready been played.", value: 1.25, prob: 1.5 },
    discard_token_restricted_2: { desc: "<b>Play</b> another food that's <b>not</b> been played.", value: 1.25, prob: 1.5 },
    play_another_majority: { desc: "<b>Play</b> another food of which you have the <b>most</b> or the <b>least</b>.", value: 1.25, prob: 1.5 },
    // play_another_restricted: { desc: "Play another food.", value: 2.0, prob: 1.5 },
    play_another_menu: { desc: "Pay the <b>beast's Menu</b> again and get its reward.", value: 2.0, prob: 0.75, max: 1 },
    play_another: { desc: "Play another food and take its action.", value: 2.5 },
    discard_token: { desc: "<b>Play</b> another 3 food.", value: 3.0, prob: 0.7, max: 1 },

    // related to influencing / forcing other players
    force_token: { desc: "<b>Force</b> a player to <b>play a specific food</b> next turn.", value: 1.25, prob: 2.0, min: 5 },
    forbid_token: { desc: "<b>Forbid</b> all players from <b>playing a specific food</b> next turn.", value: 1.75, prob: 2.0 },
    force_skip: { desc: "<b>Force</b> 2 players to <b>skip</b> their next turn.", value: 2.0, prob: 2.0, max: 2 },
    // force_switch_recipe: { desc: "<b>Pick a player</b>. They <b>switch</b> Menu start of next turn.", value: 1.25 }, => I want more recipe switching, but this is not the way
    //force_wrong: { desc: "<b>Force</b> a player to play a <b>wrong food</b> next turn.", value: 1.75, prob: 2.0 }, => same as force_token but with less strategy or interest
    force_draw: { desc: "All other players must <b>draw a Tier 1 food</b>.", value: 3.0, prob: 0.5, max: 1 },

    // related to beast state or core rules
    state_change: { desc: "<b>Flip</b> the beast's <b>State</b>.", value: 1.25, prob: 6.0, min: 8 },
    // state_change_any: { desc: "<b>Change</b> the beast's <b>State</b> to whatever you want.", value: 2.0 }, => not interesting or unique enough
    play_another_stateless: { desc: "Play another food <b>ignoring</b> all rules of the Beast.", value: 3.0, prob: 0.35, max: 1 },
    state_lock: { desc: "Until your next turn, the beast's State <b>can't be changed.</b>", value: 1.0, prob: 0.75, max: 1 },
    recipe_lock: { desc: "Until your next turn, the Menu <b>can't be switched.</b>", value: 2.0, prob: 0.5, max: 1 },
    change_direction: { desc: "Flip the <b>direction</b> of play (clockwise or not).", value: 1.0, prob: 0.75, max: 2 },
}

const CARD_TEMPLATES = 
{
    [MaterialType.RECIPE]: { frame: 0 },
    [MaterialType.VICTIM]: { frame: 1 }
}

const MISC =
{
    food_circle: { frame: 0 },
    arrow: { frame: 1 },
    beast_frame: { frame: 2 },
    modal_rule: { frame: 3 },
    modal_state: { frame: 4 },
    modal_menu: { frame: 5 },
    name_plaque: { frame: 6 },
    recipe_or_divider: { frame: 7 },
    recipe_frame: { frame: 8 },
    beast_state: { frame: 9 }
}

export {
    MaterialType,
    FOOD,
    BEASTS,
    VICTIMS,
    ACTIONS,
    CARD_TEMPLATES,
    Recipe,
    RecipeReward,
    RecipeRewardType,
    SubRecipe,
    RecipeList,
    MISC,
    GeneralData
};

