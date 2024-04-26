import { PackData } from "games/throneless-games/js_shared/dictShared"
import Point from "js/pq_games/tools/geometry/point"

const PACKS:Record<string, PackData> = 
{
    lionsyre: 
    { 
        frame: 0,
        clarification: "An <strong>open</strong> round means you vote in turn. Starting from Kingseat, clockwise, everybody votes by playing their card face-up.",
        backstory: "The Lionsyre is very close friends with the king. They have access to many state secrets and can whisper their desires into the king's ear. This, however, comes at a cost: they must play nice and follow the rules. Because the king is always watching, and they don't want to fall out of grace.",
        animal: "Lion",
        colorClass: "Yellow",
        name: {
            text: "Lionsyre",
        },
        action: {
            text: "The next round is played openly."
        },
        slogan: {
            text: "The sire inspires.",
        },
        dark: [
            "Look at the Loyalty and Hand of the current king",
            "Reveal your Hand to the King. They pick 2 cards to add to the Tell."
        ],
        edges: {
            lineScale: new Point(0.75, 0.825)
        }
    },

    slydefox: { 
        frame: 1,
        clarification: null,
        backstory: "The Slydefox manipulates and pushes people around. But never in the spotlight, never in obvious ways. Half the kingdom even forgets that this group exists. Until they’ve suddenly, out of nowhere, nobody knows how, won the election by a landslide.",
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
            text: "Make 2 players swap places. They also add 1 Hand card to the Tell.",
        },
        slogan: {
            text: "Pick cunning over running.",
        },
        dark: [
            "Trade 3 Hand cards with another player.",
            "Swap 3 random cards from the Tell with 3 Hand cards."
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
            text: "Pick a Prince. All Woolfhall voters must vote this next round.\n\nYou're the only one? All must vote this."
        },
        slogan: {
            text: "Spoilshare, howl moon, brothercare, rulers soon.",
        },
        dark: [
            "All non-Woolfhall voters show you their Loyalty.",
            "Count the number of Woolfhall voters. Each of them adds that many secret Hand cards to the Tell."
        ],
        edges: {
            lineScale: new Point(0.735, 0.78)
        }
    },

    hornseeker: { 
        frame: 3,
        clarification: null,
        backstory: "This prince is seldomly seen, which means their appearance is taken as a sign of good fortune. Some even say they have magic. Their goal has always been to unify all people and bring peace to all. To them, this should always start by being honest and keeping no secrets.",
        animal: "Unicorn",
        colorClass: "White",
        name: {
            text: "Hornseeker",
        },
        action: {
            text: "Look at the Loyalty of another sitting next to the king."
        },
        slogan: {
            text: "Honesty to peace, peace to prosperity.",
        },
        dark: [
            "Look at the Loyalty of another.",
            "Show everyone your secret Loyalty. You can only avoid this if you're currently king."
        ],
        edges: {
            lineScale: new Point(0.72, 0.785)
        }
    },

    brownbeards: { 
        frame: 4,
        clarification: "<p>To <strong>undo</strong> a round means everyone takes their card back into their Hand, and you play the round again.</p>",
        backstory: "An ancient order, wise and calm, but also slow to act and not with the times. You won't find them making aggressive moves or bold claims. They will consistently do slightly better moves than you, chipping away at whatever strength you might have, until the path towards their victory cannot be avoided.",
        animal: "Bear",
        colorClass: "Brown",
        name: {
            text: "Brownbeards",
        },
        action: {
            text: "Add this card to the Tell."
        },
        slogan: {
            text: "Wars are temporary, honey is timeless.",
            //text: "Wars are temporary, wisdom is timeless, and honey is tasty, though it gets stuck in our beards.",
        },
        dark: [
            "For every Brownbeard voter, take a Brownbeard card from the Discard into your Hand.",
            "Undo this round. This card, however, is thrown away."
        ],
        edges: {
            lineScale: new Point(0.735, 0.8)
        }
    },

    monarchrys: { 
        frame: 5,
        clarification: null,
        backstory: "These Butterflies are so beautiful and friendly, that everybody just spills all their secrets when they're near. They easily fly from castle to castle, listening in on conversations that should be private. They wouldn't abuse that power—now would they?",
        animal: "Butterfly",
        colorClass: "Pink",
        name: {
            text: "Monarchrys",
        },
        action: {
            text: "Ask another for a specific Prince. If they have such a card, they must give it.",
        },
        slogan: {
            text: "Pretty color-ups have deadly follow-ups.",
        },
        dark: [
            "Pick another player. They give you all their Dark cards.\n\nThey have none? Give your Dark cards to them.",
            "Ask another for a specific Prince. They give you all matching cards.\n\nThey have none? Give all your matching cards to them."
        ],
        edges: {
            lineScale: new Point(0.7, 0.825)
        }
    },

    crassclamps: { 
        frame: 6,
        clarification: "<p>About the Regular action: if the player doesn't have the card mentioned, they simply don't have to follow that command. They do have to follow the swap/action command, <em>even if</em> they were part of the winning vote.</p><p>About Dark 2: an open round means everyone plays their card face-up, in turn. After that special first player (picked by Crassclamps), the round continues as normal.</p>",
        backstory: "These nasty Crabs like to clamp down on everything. They won't do much themselves, but will surely try to steer what the others can and can't do. An aggressive bunch that will take control of any situation—even if it often isn't the smartest move and doesn't help them.",
        animal: "Lobster",
        colorClass: "Red",
        name: {
            text: "Crassclamps",
        },
        action: {
            text: "Tell a player which specific Prince to play next round, AND whether to swap places or take their action."
            //text: "Force all players after you to do their card action.\n\nNo next player? Tell the king which card to play next round.",
        },
        slogan: {
            text: "To squeeze or not to squeeze.",
            //text: "To be, or not to squeeze disobedience out of everyone.",
        },
        dark: [
            "Next round, all actions are worthless and can't be picked.",
            "Next round is played openly.\n\nAlso pick a player: they must play the first card."
        ],
        edges: {
            lineScale: new Point(0.725, 0.825)
        }
    },

    gulliballistas: { 
        frame: 7,
        clarification: null,
        backstory: "The Seagulls of Sincerity are famous traders, flying across all the continents, reaching the ends of the world, just to trade information. They will happily tell you what they know—but only if you give equal information in return. Work together, and you both have an equal shot at winning the game. But trust can fly away easily …",
        animal: "Seagull",
        colorClass: "Purple",
        name: {
            text: "Gulliballistas",
        },
        action: {
            text: "Both you and the king must reveal 3 Hand cards.",
        },
        slogan: {
            text: "Gullible minds speak equal truths all times.",
        },
        dark: [
            "You and the king show your entire Hand to each other.",
            "Reveal your own Hand to everyone, and force another to do the same."
        ],
        edges: {
            lineScale: new Point(0.7, 0.825)
        }
    },

    hardshellHero: { 
        frame: 8,
        clarification: "<p>As always, the Regular action is only true for this round.</p>",
        backstory: "These great sea creatures are so hard to move that most don't bother doing so. This allows them to stay in the same place, amassing power and influence, until they steamroll over the opposition. If, of course, they can get their massive body out of the water and into a rollable shape.",
        animal: "Turtle",
        colorClass: "BlueDark",
        name: {
            text: "Hardshell Hero",
        },
        action: {
            text: "Swap places with somebody and trade 2 cards with them.",
        },
        slogan: {
            text: "The shell protects, the shell serves",
            //text: "The shell protects, the shell serves,\nthe shell may waver, but never swerves.",
        },
        dark: [
            "Everyone throws away a random card, except you.",
            "Everyone who did not vote Hardshell, gives you one card from their Hand."
        ],
        edges: {
            lineScale: new Point(0.75, 0.835)
        }
    },

    squlofish: { 
        frame: 9,
        clarification: "<p>As the card states, the “action” part is the action you can choose to execute. The “tell” part is true if the card is inside the Tell. (In other words, regular Squlofish votes always count for two.)</p><p>About Dark 2: if there's a tie for the player with the most Squlofish cards, all of them must Discard.</p>",
        backstory: "Their power, quite clearly, comes from their numbers. Individually, these are tiny fish, without a mind for strategy or a body for intimidation. But together? They can overwhelm anyone without breaking a sweat—because fish cannot sweat.",
        animal: "Fish",
        colorClass: "BlueLight",
        name: {
            text: "Squlofish",
        },
        action: {
            text: "Action? Steal all Squlofish cards from another player.\n\nIn the Tell? It counts for 2 votes."
        },
        slogan: {
            text: "Swim. Swim. SHARK. Swim. Swim. ",
        },
        dark: [
            "Discard one Hand card to remove 3 Squlofish votes from the Tell.",
            "Everyone says how many Squlofish cards their Hand has. The player with the most must Discard one."
        ],
        edges: {
            lineScale: new Point(0.725, 0.815)
        }
    },

    smugwing: { 
        frame: 10,
        clarification: "<p>About the regular action: “immune” means that nobody can do an action that targets you (steal, swap, trade, whatever). They can't even <em>attempt</em> it. If the action forces them to target you, the action fails.</p><p>About Dark 2: as always, if someone doesn't <em>have</em> a Smugwing card, they just don't give you anything.</p>",
        backstory: "The Smugwings aren't subtle about their intentions: they want power. Because they want more gold for the treasure they guard. The issue is that they don't need to be subtle: they're fire-spitting dragons. If they don't want something to happen, it will not happen.",
        animal: "Dragon",
        colorClass: "Green",
        name: {
            text: "Smugwing",
        },
        action: {
            text: "Next round, you're immune to any actions aimed at you, but may not vote."
        },
        slogan: {
            text: "Protect your gold. Destroy everything else.",
        },
        dark: [
            "The winning votes go to the Discard, instead of the Tell.",
            "Everyone that voted the winning team, gives you a Smugwing card."
        ],
        edges: {
            lineScale: new Point(0.715, 0.825)
        }
    },

    salsaSalamanda: { 
        frame: 11,
        clarification: null,
        backstory: "The salamanders are infamous for their ability to change colors. They might use it to suddenly disappear into their environment, which the king finds acceptable. What they do NOT find acceptable, is their ability to change their Loyalty midway through the election.",
        animal: "Salamander",
        colorClass: "Multicolor",
        name: {
            text: "Salsa Salamanda",
        },
        action: {
            text: "Put one of the winning cards into any player's Hand, or the Discard.",
        },
        slogan: {
            text: "Dance around every tough question.",
            //text: "If anybody asks your Loyalty, just dance around the question.",
        },
        dark: [
            "Swap your Loyalty card with any other from your Hand.",
            "Swap your Loyalty card with another player."
        ],
        edges: {
            lineScale: new Point(0.75, 0.81)
        }
    },
}

const SETS =
{
    starter: ["lionsyre", "hornseeker", "monarchrys", "gulliballistas"],
    medium: ["slydefox", "brownbeards", "hardshellHero", "smugwing"],
    advanced: ["woolfhall", "crassclamps", "squlofish", "salsaSalamanda"],
    complete: Object.keys(PACKS)
}

export
{
    PACKS,
    SETS
}