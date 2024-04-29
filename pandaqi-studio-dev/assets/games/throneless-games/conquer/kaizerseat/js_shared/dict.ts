import { PackData } from "games/throneless-games/js_shared/dictShared"

// @TODO: Actions (regular + dark) for each
const PACKS:Record<string, PackData> =
{
    solongNecks: 
    { 
        frame: 0,
        clarification: "An open round means you take turns (starting from Kaizerseat, clockwise) and play your card faceup.",
        backstory: "The large frame of these giraffes gives them an imposing appearance. Some even believe they were chosen by nature to be leaders, giving them a slight edge and a constant communication with whoever sits on the Throne. Others believe their long necks will just make them miss anything that happens close to the ground---and that's where the biggest swings occur.",
        animal: "Giraffe",
        colorClass: "Yellow",

        name: 
        {
            text: "Solongnecks",
        },
        
        action: 
        {
            text: "The next round is played <b>openly</b>, but you and the Queen play their card <b>facedown</b>."
        },

        dark: ["<b>Swap places</b> with the Queen, unless they played the <b>winning type</b>."],

        slogan: 
        {
            text: "Shortneck or tallneck, we have your back.",
        },
    },

    boardomThieves: 
    { 
        frame: 1,
        backstory: "The boars and swines have mixed into a new faction that seems to have two faces. One side is playful and an entertainer, chasing away boredom and adding color to everyone's life. The other side is a bunch of greedy thieves who will give you something and then take way more in return.",
        animal: "Boar",
        colorClass: "Orange",

        name: 
        {
            text: "Boardom Thieves",
        },
        
        action: 
        {
            text: "Swap 2 <b>secret cards</b> with another player."
        },

        dark: ["Swap 3 <b>public cards</b> with another player."],

        slogan: 
        {
            text: "Your heart or your gold. You never know what we'll steal.",
        },
    },

    longswordFins: 
    { 
        frame: 2,
        backstory: "To outsiders, a single shark feels like impending doom. The sharks laugh at this and call you lucky. A lone shark is barely a threat---when they band together, that's when they can wipe out entire opposing factions in a single bite. And once a single shark ventures near the throne, they smell blood in the water.",
        animal: "Shark",
        colorClass: "Grey",

        name: 
        {
            text: "Longsword Fins",
        },
        
        action: 
        {
            text: "All Trunktrumpets trade 1 card with <b>another Trunktrumpet voter</b>. You're <b>alone</b>? <b>Flip</b> 2 Hand cards (secret <> public)."
        },

        dark: ["<b>Steal</b> as many cards from the Queen as the <b>number of Trunktrumpet voters</b>."],

        slogan: 
        {
            text: "Dum dum dum dum dum dum.",
        },
    },

    atheneyes: 
    { 
        frame: 3,
        backstory: "The wisest creatures in the forest listen to all, then think a lot and have philosophical discussions. They rarely act or spread information themselves. But with how much wisdom they gather, and how quickly, you'd think they could outwit anyone lurching for the throne.",
        animal: "Owl",
        colorClass: "White",

        name: 
        {
            text: "Atheneyes",
        },
        
        action: 
        {
            text: "Tell everyone what you'll <b>vote next round</b>. In return, one player has to <b>reveal their Hand</b> to you."
        },

        dark: ["All players <b>reveal</b> which type they have <b>the most OR the least</b> (by secretly showing you a Hand card)."],

        slogan: 
        {
            text: "Listen before speaking, think before acting.",
        },
    },

    gallopeers: 
    { 
        frame: 4,
        backstory: "These stallions think themselves above the petty fighting for the throne. They are a folk that's too proud and honorable for that nonsense. They will accept the throne if everyone else agrees to give it to them, but they will not scheme to take it. Of course, opinions can be easily swayed and friends easily made ...",
        animal: "Stallion",
        colorClass: "Brown",

        name: 
        {
            text: "Gallopeers",
        },
        
        action: 
        {
            text: "<b>Pick a Princess.</b> Both your neighbors state <b>how many</b> such cards they have."
        },

        dark: ["For each <b>public Whistley Wine</b> the Queen has, <b>steal</b> 1 card from anyone."],

        slogan: 
        {
            text: "Fight for a throne? We say NEIGH!",
        },
    },

    candlesticks: 
    { 
        frame: 5,
        backstory: "The Candlesticks are a common and welcome sight around the forest. They usually stand in the water all day, still as a statue. The others assume they're sleeping. But with their long legs and extensible neck, they can suddenly attack or steal your valuables, when you swim too close.",
        animal: "Flamingo",
        colorClass: "Pink",

        name: 
        {
            text: "Candlesticks",
        },
        
        action: 
        {
            text: "Give this card to the <b>Queen</b> as a <b>public card</b>."
        },

        dark: ["<b>Name a Princess.</b> The Queen gives you all their cards of that type."],

        slogan: 
        {
            text: "Standing on two legs is as foolish as standing on zero.",
        },
    },

    taredtula: 
    { 
        frame: 6,
        backstory: "This large spider, poisonous and merged with other insects you don't want to think about, is feared throughout the world. They crawl over your walls, step over your skin, and slowly catch you in their web. Once caught, you're forced to do whatever they please, no matter how much it goes against your own interests.",
        animal: "Spider",
        colorClass: "Red",

        name: 
        {
            text: "Taredtula",
        },
        
        action: 
        {
            text: "<b>Show</b> the Queen a Hand card. They <b>must</b> play this type next round (if possible)."
        },

        dark: ["Voting restriction is <b>inverted</b> next round. You <b>must</b> vote what you see the <b>least</b> in other player's Hands."],

        slogan: 
        {
            text: "Fear is your greatest ally. Webs are your stickiest friend.",
        },
    },

    sonarAndSons: 
    { 
        frame: 7,
        backstory: "This large family of bats, all related in some way or another, navigates political life by sonar. They can hear conversations far away, track shady deals even when they happen in deepest dark, and hang from the Throne Room's ceiling without anyone noticing. Any information gleaned ... is obviously passed on in the family.",
        animal: "Bat",
        colorClass: "Purple",

        name: 
        {
            text: "Sonar & Sons",
        },
        
        action: 
        {
            text: "The Queen <b>flips 2 public cards</b> back to secret."
        },

        dark: ["<b>Steal</b> 2 public cards from the Queen, <b>give</b> 1 secret card in return."],

        slogan: 
        {
            text: "Who can't see, must hear. Who can't hear, tough luck.",
        },
    },

    sirensOfSeatongue: 
    { 
        frame: 8,
        backstory: "The sirens distract everyone close enough to hear their beautiful songs. They have limited influence in court, as they cannot leave the water. But even from afar, they can lure powerful people into the sea and make them forget their true purpose.",
        animal: "Mermaid",
        colorClass: "BlueDark",

        name: 
        {
            text: "Sirens of Seatongue",
        },
        
        action: 
        {
            text: "Next round, you may <b>swap</b> places <b>with the Queen</b> even if they won the round."
        },

        dark: ["Next round, everyone plays a <b>random card</b>."],

        slogan: 
        {
            text: "Sing, darling, like it's your last breath. Because it is.",
        },
    },

    cracktapus: 
    { 
        frame: 9,
        backstory: "This fearsome monster was long thought to be a myth, a fairy tale to frighten children into not entering a boat at night. Until explorers discovered they were real and had claimed the entire ocean as their territory. Surprisingly, they are unwilling to let go of any of it, which is why they will do anything to get that throne.",
        animal: "Kraken",
        colorClass: "BlueLight",

        name: 
        {
            text: "Cracktapus",
        },
        
        action: 
        {
            text: "Next round, there are <b>no restrictions</b> on how you may <b>vote</b>."
        },

        dark: ["Next round, you may only <b>swap with the Queen</b> if you have <b>fewer</b> of the winning type than them."],

        slogan: 
        {
            text: "It's hard to steer a ship when there's no ship left.",
        },
    },

    ravenletters: 
    { 
        frame: 10,
        backstory: "These mighty creatures are responsible for all communication in the forest, which mostly happens through paw-written letters. This keeps them busy and gives them a high status. It also gives them endless opportunities to secretly fudge the truth and spread misinformation.",
        animal: "Raven",
        colorClass: "Green",

        name: 
        {
            text: "Ravenletters",
        },
        
        action: 
        {
            text: "All <b>non-winning</b> cards this round go to you. (Other Venomfruits can't take this action anymore.)",
        },

        dark: ["All <b>winning cards</b> this round go to you (instead of the Queen)."],
        
        slogan: 
        {
            text: "We only gamble by placing alphabets.",
        },
    },

    twistertoots: 
    { 
        frame: 11,
        backstory: "The Twistertoots are known for their artistry and whimsy. Their bid for the throne seemed almost silly, as they darted around and just made a joke of it, until their silly actions slowly gave them a bigger and bigger edge. As these seahorses discovered, if others find you funny and non-threatening, they'll feed you well.",
        animal: "Seahorse",
        colorClass: "Multicolor",

        name: 
        {
            text: "Twistertoots",
        },
        
        action: 
        {
            text: "<b>Freeze</b> all players after you. They <b>can't change</b> their position or Hand anymore this round."
        },

        dark: ["<b>Flip all</b> your cards (secret <> public), unless you're the Queen."],

        slogan: 
        {
            text: "Being predictable and colorless is the worst sin of all.",
        },
    },
}

// @TODO
const SETS =
{
    starter: ["pricklypettes", "chewyCarrots", "curlysnouts", "snufflesniff"],
    medium: ["karateChicks", "treeOfHainut", "sealalater", "ponytailors"],
    advanced: ["sleepersippies", "tinybears", "purplepaws", "ottermother"],
    complete: Object.keys(PACKS)
}

export {
    PACKS,
    SETS
}
