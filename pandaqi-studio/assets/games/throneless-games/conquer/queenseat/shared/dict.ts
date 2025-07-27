import { PackData } from "games/throneless-games/shared/dictShared"

const PACKS:Record<string, PackData> =
{
    stingersHive: 
    { 
        frame: 0,
        clarification: "An open round means you take turns (starting from Queenseat, clockwise) and play your card faceup.",
        backstory: "These bees are so tiny that you barely see them coming, barely notice them buzzing around you. But when they dislike what's going on, they will sting you and force you to be vulnerable and open.",
        animal: "Bee",
        colorClass: "Yellow",

        name: 
        {
            text: "Stinger's Hive",
        },
        
        action: 
        {
            text: "The next round is played <b>openly</b>, but you and the Queen play your card <b>facedown</b>."
        },

        dark: ["<b>Swap places</b> with the Queen, unless they played the <b>winning type</b>."],

        slogan: 
        {
            text: "No Queen Bee can be fine without a hive mind.",
        },
    },

    gallopingSun: 
    { 
        frame: 1,
        backstory: "The Galloping Sun just wants to live a normal, simple life. They take care of the little guy and the small problems, but also understand you sometimes need to fight hard against predators circling you. In their ideal world, everybody gallops together towards a setting sun.",
        animal: "Stag",
        colorClass: "Orange",

        name: 
        {
            text: "Galloping Sun",
        },
        
        action: 
        {
            text: "Swap 2 <b>secret cards</b> with another player."
        },

        dark: ["Swap 3 <b>public cards</b> with another player."],

        slogan: 
        {
            text: "To see the sun rise is a miracle. To see the sun set is a gift.",
        },
    },

    trunktrumpets: 
    { 
        frame: 2,
        backstory: "These slow, giant beasts lumber and patrol the forest, sharing information and resources. Alone they seem peaceful and harmless, and if they're honest, they are. But in numbers they will trample even the fiercest opposition on their way to the throne.",
        animal: "Elephant",
        colorClass: "Grey",

        name: 
        {
            text: "Trunktrumpets",
        },
        
        action: 
        {
            text: "All Trunktrumpets trade 1 card with <b>another Trunktrumpet voter</b>. You're <b>alone</b>? <b>Flip</b> 2 Hand cards (secret <> public)."
        },

        dark: ["<b>Steal</b> as many cards from the Queen as the <b>number of Trunktrumpet voters</b>."],

        slogan: 
        {
            text: "Trumpeteers unite, trunks withstand the fight.",
        },
    },

    featherdancer: 
    { 
        frame: 3,
        backstory: "The elegant swans are loved by all, as they dance around the forest and bring beautiful joy to every heart. Of course, for them the creatures will lower their guard and share their biggest secrets, at only the tiniest push. The swans leave with precious knowledge under their wings; none's the wiser.",
        animal: "Swan",
        colorClass: "White",
        clarification: "Of course, you must follow up on your promise on what you'll vote next round. (Unless later actions made that impossible.)",

        name: 
        {
            text: "Featherdancer",
        },
        
        action: 
        {
            text: "Tell everyone what you'll <b>vote next round</b>. In return, one player has to <b>reveal their Hand</b> to you."
        },

        dark: ["All players <b>reveal</b> which type they have <b>the most OR the least</b> (by secretly showing you a Hand card)."],

        slogan: 
        {
            text: "Spill your secrets or meet your swan song.",
        },
    },

    whistleyWine: 
    { 
        frame: 4,
        backstory: "The weasels fit in wherever there's a gap, almost becoming one with the tree trunks, matching color and expression. They are just as eager to win the throne as anyone else, but they will try it with open and simple actions. Unless it all goes wrong and they will perform the biggest heist of their lives.",
        animal: "Weasel",
        colorClass: "Brown",

        name: 
        {
            text: "Whistley Wine",
        },
        
        action: 
        {
            text: "<b>Pick a Princess.</b> Both your neighbors state <b>how many</b> such cards they have."
        },

        dark: ["For each <b>public Whistley Wine</b> the Queen has, <b>steal</b> 1 card from anyone."],

        slogan: 
        {
            text: "Amongst whistling leaves hide whistling weasels.",
        },
    },

    edibusEggsnatcher: 
    { 
        frame: 5,
        backstory: "The cute, innocent martlet does not care much for fighting for themselves. They are a small bird that can fly away if they don't like a place and lay more eggs if they are outnumbered. They are fine with being used as a tool to hand someone else a small victory---because, in practice, this ends up giving them the throne.",
        animal: "Marlet",
        colorClass: "Pink",

        name: 
        {
            text: "Eggsnatcher",
        },
        
        action: 
        {
            text: "Give this card to the <b>Queen</b> as a <b>public card</b>."
        },

        dark: ["<b>Name a Princess.</b> The Queen gives you all their cards of that type."],

        slogan: 
        {
            text: "Help is always close. Though how it appears changes every day.",
        },
    },

    fearedFlame: 
    { 
        frame: 6,
        backstory: "An aggressive prince with a sword always in Hand. Those who support him would love to wage war against everything. Whatever is in their way, should be forced to comply, or burned to the ground. The same might be true for whomever stands in their way.",
        animal: "Phoenix", // or Griffin
        colorClass: "Red",

        name: 
        {
            text: "Feared Flame",
        },
        
        action: 
        {
            text: "<b>Show</b> the Queen a Hand card. They <b>must</b> play this type next round (if possible)."
        },

        dark: ["Voting restriction is <b>inverted</b> next round. You <b>must</b> vote what you see the <b>least</b> in your neighbor's Hands."],

        slogan: 
        {
            text: "Offense is the best defense.",
        },
    },

    eyrieFeyle: 
    { 
        frame: 7,
        backstory: "With their keen eyes, the Eyrie makes the greatest spies. Nothing can stay hidden from them. Keeping secrets just means that, sooner or later, they will find out and abuse them. Because knowledge leads to votes, and votes lead to power.",
        animal: "Eagle",
        colorClass: "Purple",

        name: 
        {
            text: "Eyrie Feyle",
        },
        
        action: 
        {
            text: "The Queen <b>flips 2 public cards</b> back to secret."
        },

        dark: ["<b>Steal</b> 2 public cards from the Queen, <b>give</b> 1 secret card in return."],

        slogan: 
        {
            text: "The lion may see, but the eagle watches.",
        },
    },

    chatteredFins: 
    { 
        frame: 8,
        backstory: "The Chattered Fins still believe in the notion that everyone should be king, taking turns, switching every week. Because nobody listens, they've started to forcefully execute this idea whenever possible. When you walk into that throne room, you might not know who sits on that chair---but you know that the Fins had something to do with it.",
        animal: "Dolphin",
        colorClass: "BlueDark",
        clarification: "This overrides the usual rule that you can only swap with the Queen if you have at least as many public cards of the winning type. If the action is taken, next round you can <em>only</em> swap following this action's rule.",

        name: 
        {
            text: "Chattered Fins",
        },
        
        action: 
        {
            text: "Next round, you may only <b>swap with the Queen</b> if you have more public cards of a <b>losing type</b> (that was played) instead."
        },

        dark: ["Next round, everyone plays a <b>random card</b>."],

        slogan: 
        {
            text: "Power is never permanent.",
        },
    },

    galaksea: 
    { 
        frame: 9,
        backstory: "The starfish are an odd bunch. Some creatures believe they aren't even alive, while others believe they must be incredibly clever to live without limbs or eyes. Nobody wil ever know the truth, because when they appear, chaos ensues and nobody remembers what happened or why.",
        animal: "Starfish",
        colorClass: "BlueLight",
        clarification: "The Dark action overrides the usual rule that you can only swap with the Queen if you have at least as many public cards of the winning type. If the action is taken, next round you can <em>only</em> swap following this action's rule.",

        name: 
        {
            text: "Galaksea",
        },
        
        action: 
        {
            text: "Next round, there are <b>no restrictions</b> on how you may <b>Vote</b>."
        },

        dark: ["Next round, you may only <b>swap with the Queen</b> if you have <b>fewer</b> of the winning type than them."],

        slogan: 
        {
            text: "Bless your lucky stars that we don't have eyes or sharp teeth.",
        },
    },

    venomfruit: 
    { 
        frame: 10,
        backstory: "These serpents have a way of poisoning the leader, whispering in their ear, or literally brainwashing them with their venom. Their actions might often seem useless or stupid at first. But over time, their venom will bear irresistible fruits.",
        animal: "Serpent",
        colorClass: "Green",

        name: 
        {
            text: "Venomfruit",
        },
        
        action: 
        {
            text: "All <b>losing Votes</b> this round go to you. (Other Venomfruits can't take this action anymore.)",
        },

        dark: ["All <b>winning Votes</b> this round go to you. The Queen doesn't pick a card."],
        
        slogan: 
        {
            text: "Lisssten closssely, your exccccellencce.",
        },
    },

    colorcoats: 
    { 
        frame: 11,
        backstory: "The Colorcoats are obsessed with beauty and looks. Their reputation is everything and they'll do anything to save face. They are harmless in the sense that they won't attack you. Their endless kibbling about looks, however, and trying to flip everyone's perception, is certainly harmful to the ears.",
        animal: "Peacock",
        colorClass: "Multicolor",

        name: 
        {
            text: "Colorcoats",
        },
        
        action: 
        {
            text: "<b>Freeze</b> all players after you. They <b>can't change</b> their position or Hand anymore this round."
        },

        dark: ["<b>Flip all</b> your cards (secret <> public), unless you're the Queen."],

        slogan: 
        {
            text: "Beauty is in the eye of the beholder---and our feathers.",
        },
    },
}

const SETS =
{
    starter: ["gallopingSun", "edibusEggsnatcher", "eyrieFeyle", "venomfruit"],
    medium: ["stingersHive", "featherdancer", "whistleyWine", "galaksea"],
    advanced: ["trunktrumpets", "fearedFlame", "chatteredFins", "colorcoats"],
    complete: Object.keys(PACKS)
}

export {
    PACKS,
    SETS
}
