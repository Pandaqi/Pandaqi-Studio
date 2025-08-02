import { PackData } from "games/throneless-games/shared/dictShared"
import Point from "js/pq_games/tools/geometry/point"

export const PACKS:Record<string, PackData> = 
{
    lionsyre: 
    { 
        frame: 0,
        clarification: "An <strong>open</strong> round means you vote in turn. Starting from Kingseat, clockwise, everybody votes by playing their card face-up.",
        backstory: "The Lionsyre is very close friends with the King. They have access to many state secrets and can whisper their desires into the King's ear. This, however, comes at a cost: they must play nice and follow the rules. Because the King is always watching, and they don't want to fall out of grace.",
        animal: "Lion",
        colorClass: "Yellow",
        name: {
            text: "Lionsyre",
        },
        action: {
            text: "The next round is played <b>openly</b>."
        },
        slogan: {
            text: "The sire inspires.",
        },
        dark: [
            "<b>Look</b> at the <b>Loyalty and Hand</b> of the current King.",
            "<b>Reveal</b> your Hand to the King. They pick <b>2 cards</b> to add to the <b>Tell.</b>"
        ],
        edges: {
            lineScale: new Point(0.75, 0.825)
        }
    },

    slydefox: 
    { 
        frame: 1,
        clarification: null,
        backstory: "The Slydefox manipulates and pushes people around. But never in the spotlight, never in obvious ways. Half the Kingdom even forgets that this group exists. Until they’ve suddenly, out of nowhere, nobody knows how, won the election by a landslide.",
        animal: "Fox",
        colorClass: "Orange",
        name: {
            text: "Slydefox",
        },
        bg: {
            icon: {
                offset: new Point().fromXY(0, -0.4)
            }
        },
        action: {
            text: "Make 2 players <b>swap places</b>. They also add <b>1 Hand card</b> to the <b>Tell</b>.",
        },
        slogan: {
            text: "Pick cunning over running.",
        },
        dark: [
            "<b>Trade</b> 3 Hand cards with another player.",
            "<b>Swap</b> 3 random cards from the <b>Tell</b> with 3 Hand cards."
        ],
        edges: {
            lineScale: new Point(0.75, 0.8)
        }
    },

    woolfhall: { 
        frame: 2,
        clarification: "If multiple players execute the regular action, then only the last Prince mentioned counts. (If you don't have that Prince, just play anything you want.)",
        backstory: "This prince maintains a large network of associates. They hunt and manipulate in packs. One moment, you think you're alone. The next, you're swarmed by five people trying to convince you to vote Woolfhall. It's hard to say no then.",
        animal: "Wolf",
        colorClass: "Grey",
        name: {
            text: "Woolfhall",
        },
        action: {
            text: "<b>Pick a Prince.</b> All Woolfhall voters <b>must vote this</b> next round. You're alone? <b>All</b> must vote this."
        },
        slogan: {
            text: "Spoilshare, howl moon, brothercare, rulers soon.",
        },
        dark: [
            "All <b>non-Woolfhall voters</b> show you their <b>Loyalty</b>.",
            "Count the <b>number of Woolfhall voters</b>. Each of them adds that many secret Hand cards <b>to the Tell</b>."
        ],
        edges: {
            lineScale: new Point(0.735, 0.78)
        }
    },

    hornseeker: 
    { 
        frame: 3,
        clarification: null,
        backstory: "This prince is seldomly seen, which means their appearance is taken as a sign of good fortune. Some even say they have magic. Their goal has always been to unify all people and bring peace to all. To them, this should always start by being honest and keeping no secrets.",
        animal: "Unicorn",
        colorClass: "White",
        name: {
            text: "Hornseeker",
        },
        action: {
            text: "<b>Look</b> at the <b>Loyalty</b> of another sitting <b>next to</b> the King."
        },
        slogan: {
            text: "Honesty to peace, peace to prosperity.",
        },
        dark: [
            "<b>Look</b> at the <b>Loyalty</b> of another.",
            "<b>Show</b> everyone your secret <b>Loyalty</b>. You become King next round; nothing can stop that."
        ],
        edges: {
            lineScale: new Point(0.72, 0.785)
        }
    },

    brownbeards: 
    { 
        frame: 4,
        clarification: "<p>To <strong>undo</strong> a round means everyone takes their card back into their Hand, and you play the round again.</p>",
        backstory: "An ancient order, wise and calm, but also slow to act and not with the times. You won't find them making aggressive moves or bold claims. They will consistently do slightly better moves than you, chipping away at whatever strength you might have, until the path towards their victory cannot be avoided.",
        animal: "Bear",
        colorClass: "Brown",
        name: {
            text: "Brownbeards",
        },
        action: {
            text: "<b>Add</b> this card to the <b>Tell</b>."
        },
        slogan: {
            text: "Wars are temporary, honey is timeless.",
            //text: "Wars are temporary, wisdom is timeless, and honey is tasty, though it gets stuck in our beards.",
        },
        dark: [
            "For <b>every Brownbeard voter</b>, take a Brownbeard card <b>from the Discard</b> into your Hand.",
            "<b>Undo</b> this round. This card, however, is <b>Discarded</b>."
        ],
        edges: {
            lineScale: new Point(0.735, 0.8)
        }
    },

    monarchrys: 
    { 
        frame: 5,
        clarification: null,
        backstory: "These Butterflies are so beautiful and friendly, that everybody just spills all their secrets when they're near. They easily fly from castle to castle, listening in on conversations that should be private. They wouldn't abuse that power—now would they?",
        animal: "Butterfly",
        colorClass: "Pink",
        name: {
            text: "Monarchrys",
        },
        action: {
            text: "<b>Ask</b> another for a <b>specific Prince</b>. If they have such a card, they must <b>give it</b>.",
        },
        slogan: {
            text: "Pretty color-ups have deadly follow-ups.",
        },
        dark: [
            "<b>Pick another player.</b> They give you all their <b>Dark cards</b>. They have none? Give your Dark cards <b>to them</b>.",
            "<b>Ask</b> another for a <b>specific Prince</b>. They give you all <b>matching cards</b>. They have none? Give all your matching cards <b>to them</b>."
        ],
        edges: {
            lineScale: new Point(0.7, 0.825)
        }
    },

    crassclamps: 
    { 
        frame: 6,
        clarification: "<p>About the Regular action: if the player doesn't have the card mentioned, they simply don't have to follow that command. They do have to follow the swap/action command, <em>even if</em> they were part of the winning vote.</p><p>About Dark 2: an open round means everyone plays their card face-up, in turn. After that special first player (picked by Crassclamps), the round continues as normal.</p>",
        backstory: "These nasty Crabs like to clamp down on everything. They won't do much themselves, but will surely try to steer what the others can and can't do. An aggressive bunch that will take control of any situation—even if it often isn't the smartest move and doesn't help them.",
        animal: "Lobster",
        colorClass: "Red",
        name: {
            text: "Crassclamps",
        },
        action: {
            text: "Tell a player <b>which Prince to play</b> next round AND whether to <b>swap places or not</b>."
            //text: "Force all players after you to do their card action.\n\nNo next player? Tell the King which card to play next round.",
        },
        slogan: {
            text: "To squeeze or not to squeeze.",
            //text: "To be, or not to squeeze disobedience out of everyone.",
        },
        dark: [
            "Next round, all <b>actions</b> are worthless and <b>can't be picked</b>.",
            "Next round is <b>played openly</b>.\n\nAlso pick a player: they must play the <b>first card</b>."
        ],
        edges: {
            lineScale: new Point(0.725, 0.825)
        }
    },

    gulliballistas: 
    { 
        frame: 7,
        clarification: null,
        backstory: "The Seagulls of Sincerity are famous traders, flying across all the continents, reaching the ends of the world, just to trade information. They will happily tell you what they know—but only if you give equal information in return. Work together, and you both have an equal shot at winning the game. But trust can fly away easily …",
        animal: "Seagull",
        colorClass: "Purple",
        name: {
            text: "Gulliballistas",
        },
        action: {
            text: "Both you and the King must <b>reveal 3 Hand cards</b>.",
        },
        slogan: {
            text: "Gullible minds speak equal truths all times.",
        },
        dark: [
            "You and the King <b>show</b> your entire <b>Hand to each other</b>.",
            "<b>Reveal</b> your own Hand to <b>everyone</b>, and force another to do the same."
        ],
        edges: {
            lineScale: new Point(0.7, 0.825)
        }
    },

    hardshellHero: 
    { 
        frame: 8,
        clarification: "<p>As always, the Regular action is only true for this round.</p>",
        backstory: "These great sea creatures are so hard to move that most don't bother doing so. This allows them to stay in the same place, amassing power and influence, until they steamroll over the opposition. If, of course, they can get their massive body out of the water and into a rollable shape.",
        animal: "Turtle",
        colorClass: "BlueDark",
        name: {
            text: "Hardshell Hero",
        },
        action: {
            text: "<b>Swap places</b> with somebody and <b>trade 2 cards</b> with them.",
        },
        slogan: {
            text: "The shell protects, the shell serves",
            //text: "The shell protects, the shell serves,\nthe shell may waver, but never swerves.",
        },
        dark: [
            "<b>Everyone Discards</b> a random card, <b>except you</b>.",
            "Everyone who did <b>not</b> vote Hardshell, <b>gives you</b> one card from their Hand."
        ],
        edges: {
            lineScale: new Point(0.75, 0.835)
        }
    },

    squlofish: { 
        frame: 9,
        clarification: "<p>The action is stealing cards and optional (as usual). Squlofish, however, are <em>always</em> worth 2 votes each when counting the Tell at the end.</p><p>About Dark 2: if there's a tie for the player with the most Squlofish cards, all tied players must Discard.</p>",
        backstory: "Their power, quite clearly, comes from their numbers. Individually, these are tiny fish, without a mind for strategy or a body for intimidation. But together? They can overwhelm anyone without breaking a sweat—because fish cannot sweat.",
        animal: "Fish",
        colorClass: "BlueLight",
        name: {
            text: "Squlofish",
        },
        action: {
            text: "<b>Steal</b> all Squlofish cards from another player. Inside the Tell, each Squlofish counts for <b>2 votes</b>."
        },
        slogan: {
            text: "Swim. Swim. SHARK. Swim. Swim. ",
        },
        dark: [
            "<b>Discard</b> one Hand card to <b>remove 3 Squlofish</b> votes from the Tell.",
            "Everyone says <b>how many Squlofish</b> they have. The player with the <b>most</b> must Discard one."
        ],
        edges: {
            lineScale: new Point(0.725, 0.815)
        }
    },

    smugwing: 
    { 
        frame: 10,
        clarification: "<p>“Immune” means that nobody can do an action that targets you (steal, swap, trade, whatever). If an action forces them to target you, the action fails.</p><p>About Dark 2: if someone doesn't <em>have</em> a Smugwing card, they just don't give you anything.</p>",
        backstory: "The Smugwings aren't subtle about their intentions: they want power. Because they want more gold for the treasure they guard. The issue is that they don't need to be subtle: they're fire-spitting dragons. If they don't want something to happen, it will not happen.",
        animal: "Dragon",
        colorClass: "Green",
        name: {
            text: "Smugwing",
        },
        action: {
            text: "Next round, you're <b>immune</b>, but <b>may not vote</b>."
        },
        slogan: {
            text: "Protect your gold. Destroy everything else.",
        },
        dark: [
            "The <b>winning votes</b> go to the <b>Discard</b>, instead of the Tell.",
            "Everyone that voted the <b>winning</b> Prince, gives you a Smugwing card."
        ],
        edges: {
            lineScale: new Point(0.715, 0.825)
        }
    },

    salsaSalamanda: 
    { 
        frame: 11,
        backstory: "The salamanders are infamous for their ability to change colors. They might use it to suddenly disappear into their environment, which the King finds acceptable. What they do NOT find acceptable, is their ability to change their Loyalty midway through the election.",
        animal: "Salamander",
        colorClass: "Multicolor",
        name: {
            text: "Salsa Salamanda",
        },
        action: {
            text: "Put one of the winning cards into <b>any player's Hand OR the Discard</b>.",
        },
        slogan: {
            text: "Dance around every tough question.",
            //text: "If anybody asks your Loyalty, just dance around the question.",
        },
        dark: [
            "<b>Swap your Loyalty</b> card with any other from your <b>Hand</b>.",
            "<b>Swap your Loyalty</b> card with another <b>player</b>."
        ],
        edges: {
            lineScale: new Point(0.75, 0.81)
        }
    },
}

export const SETS =
{
    starter: ["lionsyre", "hornseeker", "monarchrys", "gulliballistas"],
    medium: ["slydefox", "brownbeards", "hardshellHero", "smugwing"],
    advanced: ["woolfhall", "crassclamps", "squlofish", "salsaSalamanda"],
    complete: Object.keys(PACKS)
}