import { ActionType, CardType, PackData } from "games/throneless-games/shared/dictShared"

export const PACKS:Record<string, PackData> =
{
    solongnecks: 
    { 
        frame: 0,
        clarification: "An open round means you take turns (starting from Kaizerseat, clockwise) and play your card faceup.",
        backstory: "The large frame of these giraffes gives them an imposing appearance. Some even believe they were chosen by nature to be leaders, giving them a slight edge and a export constant communication with whoever sits on the Throne. Others believe their long necks will just make them miss anything that happens close to the ground---and that's where the biggest swings occur.",
        animal: "Giraffe",
        colorClass: "Yellow",

        name: 
        {
            text: "Solongnecks",
        },
        
        action: 
        {
            text: "The next round is played <b>openly</b>.",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "You become <b>Leader</b> next round; nothing can override that.", type: ActionType.WON },
            { text: "Pick any card played this round as your <b>new Loyalty</b>.", type: ActionType.HANDLE },
            { text: "In open rounds, you still <b>vote facedown</b>.", type: ActionType.HIRE },
        ],

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
            text: "If this is the <b>first or last card</b>, swap 1 winning Vote for a Hand card.",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "<b>Swap</b> your Vote for a different one <b>from your Hand</b>.", type: ActionType.REVEAL },
            { text: "<b>Rearrange</b> the order of up to 3 Votes.", type: ActionType.REVEAL },
            { text: "You <b>don't swap places</b> when your action does nothing.", type: ActionType.HIRE },
        ],

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
            text: "If there are 2 Longsword (or more), they <b>win the round</b>. Otherwise, <b>discard all</b>.",
            type: ActionType.REVEAL
        },

        dark: [
            { text: "Worth as many points as the <b>number of Longsword Votes</b> in the Tell.", type: ActionType.TELL },
            { text: "<b>Swap</b> a Hand card with all other <b>Longsword voters</b>.", type: ActionType.HANDLE },
            { text: "You <b>can't vote Longsword</b> unless you have no other choice.", type: ActionType.HIRE },
        ],

        slogan: 
        {
            text: "Dum dum dum dum dum dum.",
        },
    },

    atheneyes: 
    { 
        frame: 3,
        backstory: "The wisest creatures in the forest listen to all, then think a lot and have philosophical discussions. They rarely act or spread information themselves. But with how much wisdom they gather, and how quickly, you'd think they could outwit anyone lurching for the throne.",
        clarification: "If anyone wants to play a flipped card (which is public information), they must say so and the Vote for that round stops being simultaneous. (Vote in clockwise turns, starting from Kaizerseat.)",
        animal: "Owl",
        colorClass: "White",

        name: 
        {
            text: "Atheneyes",
        },
        
        action: 
        {
            text: "All neighbors <b>flip</b> a card (to face away from them).",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "All players state <b>how many cards</b> they have of the <b>type they Voted</b>.", type: ActionType.HANDLE },
            { text: "All players <b>flip</b> one card (to face away from them), except you.", type: ActionType.WON },
            { text: "Each round, you may pick one neighbor who <b>must Vote faceup</b> before anyone else.", type: ActionType.HIRE },
        ],

        slogan: 
        {
            text: "Listen before speaking, think before acting.",
        },
    },

    gallopeers: 
    { 
        frame: 4,
        backstory: "These stallions think themselves above the petty fighting for the throne. They are a folk that's too proud and honorable for that nonsense. They will accept the throne if everyone else agrees to give it to them, but they will not scheme to take it. Of course, opinions can be easily swayed and friends easily made ...",
        clarification: "About Dark 3 => Some cards have rules about the entire structure of the game, things all players MUST follow or the game breaks down. The action obviously does not exempt you from those; only from those where it's possible to make an exception for you.",
        animal: "Stallion",
        colorClass: "Brown",

        name: 
        {
            text: "Gallopeers",
        },
        
        action: 
        {
            text: "<b>Move the Thronecard</b> to another player who did <b>not win</b>.",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "<b>Change the Seatcard</b> to the next one from the top of the deck.", type: ActionType.REVEAL },
            { text: "<b>Change the Thronecard</b> to the next one from the top of the deck. ", type: ActionType.HANDLE },
            { text: "Any rules from the Seatcard or Thronecard <b>don't apply to you</b> (if possible).", type: ActionType.HIRE },
        ],

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
            text: "<b>Take</b> any card you want <b>from the Discard</b>.",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "All <b>other Candlesticks</b> played this round go <b>into your Hand</b>.", type: ActionType.HANDLE },
            { text: "If your Hand contains <b>all Seekers</b> in the game, <b>steal</b> 1 card from everyone.", type: ActionType.HANDLE },
            { text: "<b>Take</b> any card you want <b>from the Tell</b>.", type: ActionType.HANDLE },
        ],

        slogan: 
        {
            text: "Standing on two legs is as foolish as standing on zero.",
        },
    },

    taredtula: 
    { 
        frame: 6,
        backstory: "This large spider, poisonous and merged with other insects you don't want to think about, is feared throughout the world. They crawl over your walls, step over your skin, and slowly catch you in their web. Once caught, you're forced to do whatever they please, no matter how much it goes against your own interests.",
        clarification: "If you tell another player which type they must (not) vote, and they simply can't comply, then they may simply ignore your command.",
        animal: "Spider",
        colorClass: "Red",

        name: 
        {
            text: "Taredtula",
        },
        
        action: 
        {
            text: "Tell another player what type they <b>must Vote</b> next round.",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "<b>Remove</b> up to 2 cards played <b>before you</b> (in this round).", type: ActionType.REVEAL },
            { text: "<b>Pick a player and name a Seeker.</b> They must honestly answer if they have it, and if so, give it.", type: ActionType.HANDLE },
            { text: "Each round, tell one of your neighbors which type they're <b>not allowed to Vote</b>.", type: ActionType.HIRE },
        ],

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
        clarification: "About the regular action => The other player is required to follow up on his promised Vote, of course. Unless later actions or rule twists make this impossible (such as losing their final card of the promised type).",

        name: 
        {
            text: "Sonar & Sons",
        },
        
        action: 
        {
            text: "One neighbor shows you what they <b>will vote next round</b>.",
            type: ActionType.WON
        },

        dark: [
            { text: "<b>Steal</b> a <b>hired</b> card from another player.", type: ActionType.HANDLE },
            { text: "Decide this round's direction: <b>clockwise or counter clockwise</b>. This overrides the Leader's decision.", type: ActionType.REVEAL },
            { text: "Before each round, you may <b>look</b> at the <b>Tell</b> OR the <b>Leader's Hand</b>.", type: ActionType.HIRE },
        ],

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
        clarification: "About Dark 3 => The final leader simply decides this by naming the type they want to increase in the Tell, at the end of the game.",

        name: 
        {
            text: "Seatongue Sirens",
        },
        
        action: 
        {
            text: "<b>Pick a player</b> next to the Leader. They play a <b>random</b> (blind) card next round.",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "If the Leader is your <b>neighbor</b>, <b>give them 3 cards</b>.", type: ActionType.HANDLE },
            { text: "The round instantly <b>ends</b>.", type: ActionType.HANDLE },
            { text: "The <b>final Leader</b> adds 2 Votes to one type in the Tell OR 3 Votes to Sirens.", type: ActionType.TELL },
        ],

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
            text: "<b>Swap</b> a vote from one neighbor with the <b>top one from the Tell</b>.",
            type: ActionType.REVEAL
        },

        dark: [
            { text: "Worth 4 Votes if the <b>final Leader's Loyalty matches</b> this card, otherwise -4 Votes.", type: ActionType.TELL },
            { text: "<b>Removes 1 Vote</b> from all other types.", type: ActionType.TELL },
            { text: "<b>Removes 3 Votes</b> from the <b>highest scoring</b> type in the Tell.", type: ActionType.TELL },
        ],

        slogan: 
        {
            text: "It's hard to steer a ship when there's no ship left.",
        },
    },

    ravenletters: 
    { 
        frame: 10,
        backstory: "These mighty creatures are responsible for all communication in the forest, which mostly happens through paw-written letters. This keeps them busy and gives them a high status. It also gives them endless opportunities to secretly fudge the truth and spread misinformation.",
        clarification: "Immune means you can't be targeted for actions. This includes being targeted for swapping places.",
        animal: "Raven",
        colorClass: "Green",

        name: 
        {
            text: "Ravenletters",
        },
        
        action: 
        {
            text: "Both you and the player after you <b>don't need</b> to execute their card or swap places.",
            type: ActionType.HANDLE
        },

        dark: [
            { text: "You are <b>immune</b> this round.", type: ActionType.REVEAL },
            { text: "Everyone <b>whose Hand contains Ravenletters</b> must reveal this. They are all <b>immune</b> this round.", type: ActionType.HANDLE },
            { text: "Each round, you can <b>veto</b> one player who wants to swap places with you.", type: ActionType.HIRE },
        ],
        
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
            text: "<b>Copy the card</b> of the neighbor before you (both type and action).",
            type: ActionType.REVEAL
        },

        dark: [
            { text: "You're ashamed of losing and <b>don't Vote anything</b> next round.", type: ActionType.HANDLE },
            { text: "<b>Add 2 Hand cards</b> directly to the Tell.", type: ActionType.WON },
            { text: "If the Leader did <b>not win</b>, all cards of the type they played <b>also go into the Tell</b>.", type: ActionType.HANDLE },
        ],

        slogan: 
        {
            text: "Being predictable and colorless is the worst sin of all.",
        },
    },
}

export const SETS =
{
    starter: ["boardomThieves", "candlesticks", "sonarAndSons", "twistertoots"],
    medium: ["solongnecks", "atheneyes", "gallopeers", "sirensOfSeatongue"],
    advanced: ["longswordFins", "taredtula", "cracktapus", "ravenletters"],
    complete: Object.keys(PACKS)
}

export const THRONE_CARDS =
[
    "<b>Alternate</b> between <em>open</em> and <em>secret</em> rounds. Start with an open round.",
    "<b>Don't pick a Loyalty.</b> Instead, your <em>last Hand card</em> becomes your Loyalty.\n\n(You're out of the game once you have 1 card left, and you can't lose that one for any reason.)",
    "<b>Don't pick a Loyalty.</b> Instead, the <em>first card</em> you're dealt is your Loyalty.",
    "Use a <b>fixed hand order</b>. Once you've received your cards and sorted them, never change their order again.\n\nYou can only Vote with <b>the left-most or right-most card</b>.",
    "Before each round, all players <b>give 1 card</b> in the opposite direction of the round's direction (simultaneously).",
    "Before the game starts, all players <b></b>give 2 cards to the right</b> and <b>2 cards to the left</b> (simultaneously).",
    "If tied, <b>all types with majority win</b>.",
    "When you <b>swap places</b> with someone, also <b>swap 1 Hand card</b>.",
    "Each round, the <b>Leader picks one player</b>: they must vote <em>faceup</em> and <em>before anyone else</em>. ",
    "Each round, the <b>Leader can VETO a type</b>. You can't vote it (if possible).",
    "Each round, the <b>Leader names 2 possible types</b>. You must vote one of those (if possible).",
    "The type with the <b>longest unbroken sequence</b> (in the circle of votes) wins.\n\nTied? Simply use regular voting rules to resolve it.",
    "When you <b>lose a round</b> and your <b>action triggers</b>, you may also take the card <b>back into your Hand</b> instead.",
    "One player <b>starts without cards</b>. All winning Votes go <em>into their Hand</em>; they play using those cards.\n\nThey name a Seeker at the start and <b>win alone</b> if that one ends up winning.",
    "One player <b>starts without cards</b>. All Discarded cards go <em>into their Hand</em>; they play using those cards.\n\nThey name a Seeker at the start and <b>win alone</b> if that one ends up winning.",
    "It's <b>forbidden</b> to Vote the type on <b>top of the Discard pile</b> (if possible).",
    "Keep the Tell <em>faceup</em> (instead of facedown). It's <b>forbidden</b> to play the type at the <b>top of the Tell</b> (if possible).",
    "<b>Voting is always open.</b>\n\nAfter each round, losers <b>flip</b> 1 Hand card to <em>face away from them</em>, winners <b>flip</b> 1 Hand card <em>back to face them</em>.",
    "Include one more Seeker and name them <b>wildcard</b>.\n\nThey are not themselves---their type is whatever other Seeker (that's in the game) you want it to be.",
    "The Leader <b>doesn't choose direction</b>.\n\nIf the Leader <b>won</b> the previous round, go <b>counter clockwise</b>. Otherwise, go <b>clockwise</b>."
]


export const SEAT_CARDS =
[
    "The direction of this round is <b>counter clockwise</b>.",
    "This round is played <b>openly</b>.",
    "The <b>Leader must VETO</b> one player <em>before voting</em>. The card they play is simply discarded.",
    "The <b>Leader must VETO</b> one player <em>after voting</em>. The card they played is simply discarded.",
    "Before the round starts, <b>give 2 cards</b> to the player on your left or right. (Leader decides direction.)",
    "The <b>Leader votes first</b>, faceup. Everyone else must Vote <b>the same type</b> (if they can).",
    "All <b>winning players add</b> a secret Hand card to the Tell.",
    "All <b>winning players remove</b> one card (of choice) from the Tell.",
    "If you <b>swap places</b> with someone, also <b>reveal your Loyalty</b> to each other.",
    "If you <b>swap places,</b> with someone, also <b>reveal 3 Hand cards</b> to each other.",
    "The type with the <b>least votes</b> wins this round.\n\nTied? pick the <em>first option</em>.",
    "The type with the <b>least votes</b> wins this round.\n\nTied? pick the <em>last option</em>.",
    "If tied, the <b>last type</b> with the most votes wins this round.",
    "When checking votes and handling cards, start from the player <b>after the Kaizerseat</b>.",
    "If tied, <b>nobody wins</b> this round.",
    "The player <b>before Kaizerseat</b> ( = last in order) may <b>see 2 Votes</b> before making their decision.",
    "<b>All winners</b> this round must <b>reveal their Loyalty</b> to everyone.",
    "<b>Nobody may swap</b> places this round. (Card does nothing? You do nothing.)",
    "When the round is over, the <b>Leader must swap places</b> with someone else.",
    "<em>When Revealed</em> actions <b>don't work</b>.",
    "<em>When Hired</em> actions <b>don't work</b>. (They don't stay when played; their powers don't apply.)",
    "<b>Handling</b> the remaining cards goes in the <b>opposite direction</b> of checking votes.",
    "<b>The Leader reveals their entire Hand.</b>\n\nOther players must Vote one of the <b>types they have</b> (if possible).",
    "If the <b>Leader wins</b> this round, they <b>steal a HIRED card</b> from another.",
    "<em>When Handled</em> actions only trigger if <b>a neighbor also played one</b>.",
    "<em>Dark</em> actions <b>don't work</b>.",
    "If you're the <b>only voter</b> of your type, <b>add</b> your card to the Tell.",
    "If you're the <b>only voter</b> of your type, <b>take back</b> your card into your Hand.",
    "The Leader <b>does not Vote</b>.",
    "The round <b>ends instantly</b> once a single player has <b>swapped places</b>.",
    "If the winning type has <b>3 cards or more, nobody wins</b> this round.",
    "If the winning type has <b>2 cards or fewer, nobody wins</b> this round.",
    "<b>Winning Votes go to Discard</b>; all losing Votes go to the Tell.",
    "The winning voter <b>closest to Kaizerseat, steals</b> 1 card from all other players.",
]

export const ACTION_TYPES =
{
    [ActionType.HANDLE]: { frame: 0, label: "When Handled" },
    [ActionType.REVEAL]: { frame: 1, label: "When Revealed" },
    [ActionType.WON]: { frame: 2, label: "When Won" },
    [ActionType.TELL]: { frame: 3, label: "When Tell" },
    [ActionType.HIRE]: { frame: 4, label: "When Hired" },
}