import toTextDrawerImageStrings from "js/pq_games/tools/text/toTextDrawerImageStrings"

export interface CardResource
{
    type: string,
    cross?: boolean
}

export interface CardResourceData
{
    good: CardResource[],
    bad: CardResource[]
}

export interface CardGadgetData
{
    green: { cost: string[], reward: string, label: string },
    red: { cost: string[], reward: string, label: string }
}

export interface CardPowerData
{
    good: string,
    bad: string
}

export enum CardType
{
    MISSION,
    IDENTITY,
    VOTE,
    SHOP
}

export type CardSubType = VoteType | IdentityCardType | MissionType | ShopType

export enum ShopType
{
    SHOP = "shop"
}

export enum MissionType
{
    MISSION = "mission",
    MASTER = "master"
}

export enum VoteType
{
    YES = "yes",
    NO = "no"
}

export enum IdentityCardType
{
    PUBLIC = "public",
    PRIVATE = "private" 
}

export enum IdentityType
{
    GOOD = "good",
    BAD = "bad"
}

export interface IdentityCardData
{
    desc: string,
    type: IdentityType
}

// each identity card combines a GOOD and a BAD power for balance
// (remember all these options are dynamically filled in, so there are actually hundreds of unique ones below)
export const PUBLIC_IDENTITIES:Record<string,IdentityCardData> =
{
    forced_vote_resource: { desc: "You must <b>vote %vote%</b> if the mission contains %num% %resource% (or more).", type: IdentityType.BAD },
    forced_vote_num: { desc: "You must <b>vote %vote%</b> if the mission has %comparison% %num% cards", type: IdentityType.BAD },
    double_vote_resource: { desc: "If the mission contains %num% %resource% (or more), your vote <b>counts double</b>.", type: IdentityType.GOOD },
    double_vote_num: { desc: "If the mission contains %comparison% %num% cards, your vote <b>counts double</b>.", type: IdentityType.GOOD },
    neighbor_vote_type: { desc: "If you voted the <b>same</b> as both your neighbors, your vote <b>doesn't count</b>.", type: IdentityType.BAD },
    neighbor_vote_num: { desc: "If your number is <b>lower</b> than both your neighbors, your vote <b>doesn't count</b>.", type: IdentityType.BAD },
    forbidden_resource: { desc: "If the mission contains %num% %resource% (or more), your vote <b>doesn't count</b>.", type: IdentityType.BAD },
    forbidden_num: { desc: "When proposing a mission, it must always have <b>%comparison% %num% cards</b>.", type: IdentityType.BAD },

    change_vote_num_raise: { desc: "<b>Voted %vote%</b>? Add 15 to your number (unless it creates duplicates).", type: IdentityType.BAD },
    change_vote_num_lower: { desc: "<b>Voted %vote%</b>? Subtract 15 from your number (unless it creates duplicates).", type: IdentityType.GOOD },

    // @TODO: hard to guarantee order if multiple players have this, think about this
    change_order: { desc: "If <b>mission %status%</b> and you <b>voted %vote%</b>, you collect a card before anyone else.", type: IdentityType.GOOD }, 
    master_card: { desc: "If <b>mission %status%</b> and the active player <b>voted %vote%</b>, you win the Master Card.", type: IdentityType.GOOD },

}

export const SECRET_IDENTITIES:Record<string, IdentityCardData> =
{
    resource_improve: { desc: "All %resource% are worth <b>2 points</b>.", type: IdentityType.GOOD },
    resource_degrade: { desc: "All %resource% are worth <b>-1 points</b>.", type: IdentityType.BAD },
    total_resource_penalty: { desc: "If you have 4 %resource% (or more), you get <b>-5 points</b>.", type: IdentityType.BAD },
    total_resource_bonus: { desc: "If you have 8 %resource% (or more), you get <b>+10 points</b>.", type: IdentityType.GOOD },
    pair_bonus: { desc: "Every <b>pair</b> of %resource% and %resource% is worth <b>1 extra point</b>.", type: IdentityType.GOOD },
    pair_penalty: { desc: "Every <b>pair</b> of %resource% and %resource% is worth <b>1 fewer point</b>.", type: IdentityType.BAD },
    odd_resource_penalty: { desc: "If you have an <b>odd</b> number of %resource%, you get <b>-4 points</b>.", type: IdentityType.BAD },
    even_resource_bonus: { desc: "If you have an <b>even</b> number of %resource%, you get <b>+4 points</b>.", type: IdentityType.GOOD },
    limited_card_benefit: { desc: "For each card won, pick <b>1 icon</b> that's <b>ignored</b> when scoring.", type: IdentityType.BAD },
    increased_card_benefit: { desc: "Each card won that shows %comparison% %num% icons has its <b>value doubled</b>.", type: IdentityType.GOOD }
}


export interface MasterCardData
{
    desc: string,
}

export const MASTER_CARDS:Record<string,MasterCardData> =
{
    number_cutoff_high: { desc: "Votes <b>above 15</b> don't count." },
    number_cutoff_low: { desc: "Votes <b>below 15</b> don't count." },
    cards_num_high: { desc: "This mission needs <b>at least 3 cards</b>." },
    cards_num_low: { desc: "This mission can have <b>at most 2 cards</b>." },
    votes_num: { desc: "Players <em>may</em> cast <b>2 votes</b>." },
    no_voters_include: { desc: "All NO voters must <b>collect a card too</b>, with red side up." },
    identical_voters: { desc: "If everyone <b>votes the same</b>, end the round immediately." },

    yes_vote_required: { desc: "You <b>must</b> vote YES." },
    no_vote_required: { desc: "You <b>must</b> vote NO." },
    yes_vote_double: { desc: "All YES-votes <b>count double</b>." },
    no_vote_double: { desc: "All NO-votes <b>count double</b>." },
    double_vote_active: { desc: "The vote of the active player <b>counts double</b>." },
    study_master_cards: { desc: "Reveal the <b>top 5 Master Cards</b> in the deck." },

    swap_votes: { desc: "<b>Round Start</b>: everyone discards 3 Votes and draws 3 new ones." },
    flip_card: { desc: "<b>Round Start</b>: everyone rotates 1 of their cards (green side <> red side)." },
    reveal_hand_yes: { desc: "<b>Round End</b>: all YES-voters <em>reveal their hand Votes</em>." },
    reveal_hand_no: { desc: "<b>Round End</b>: all NO-voters <em>reveal their hand Votes</em>." },

    majority_raise: { desc: "This mission needs <b>1 more YES</b> than usual to <em>SUCCEED</em>." },
    majority_lower: { desc: "This mission needs <b>1 fewer YES</b> than usual to <em>SUCCEED</em>." },
    invert_order: { desc: "The <b>order</b> for collecting cards after voting is <b>inverted</b>." },
    open_voting: { desc: "<b>A public vote!</b> From active player, vote in clockwise turns, faceup." },

    resource_diversity_max: { desc: "The mission may include <b>at most 2 different resources</b>." },
    resource_diversity_min: { desc: "The mission must include <b>at least 3 different resources</b>." },
    give_info: { desc: "<b>Round Start</b>: Everyone states their <em>lowest</em> or <em>highest</b> hand Vote." },

    // these rules (with "highest voter") aim to make it specific to _one player_, not all,
    // which allows the card to be meaningfully "played" too
    // @TODO: invent a few more of these with variations of lowest number and such
    late_change: { desc: "<b>After Voting</b>: the highest voter may still <em>add or remove a mission card</em>." },
    swap_card: { desc: "<b>After Voting</b>: the highest voter <em>swaps</em> 1 collected card with one from another player." }
}

export const RESOURCES =
{
    gold: { frame: 0 },
    reputation: { frame: 1 },
    weapons: { frame: 2 },
    intelligence: { frame: 3 }
}

export const MISC =
{
    cross: { frame: 4 }
}

export const RANDOM_TEXTS = [
    "Break into vault", "Distract the guard", "Shatter the glass", "Hack the system",
    "Sound the alarm", "Load the gadgets", "Place the bomb", "Start the timer",
    "Pick the lock", "Kick in the door", "Call in support", "Dig a tunnel",
    "Pretend you belong", "Impersonate someone", "Shut off cameras", "Plant a bug",
    "Recruit an expert", "Trust your friends", "Hope and pray", "Make a wish",
    "Check your bag", "Cut the wire", "Cut the power", "Create a distraction",
    "Blend into crowd", "Open the backdoor", "Eavesdrop the target", "Wear a disguise",
    "Wait for instructions", "Change your loyalty", "Double cross everyone", "Crack the code",
    "Sneak into rooms", "Rummage through drawers", "Use our lasers", "Make hand signs",
    "Make new plans", "Steal their valuables", "Pet the dog", "Find the password",
    "Place a tracker", "Triangulate their location", "Speak double speak", "Run away",
    "Enter a fistfight", "Open all windows", "Hijack their Wi-Fi", "Make vague threats",
    "Stay in shadows", "Make our escape", "Draw a map", "Unlock their safe"
];

export enum ShopVibe
{
    GREEN = "green", // these appear on the GREEN side of the shop card
    RED = "red" // these appear on the RED side of the shop card (they're not bad, they're just slightly less good)
}

export const SHOP_REWARDS =
{
    free_mission_card: { desc: "<b>Draw any Mission Card</b> from market. You win it, green side up.", vibe: ShopVibe.GREEN },
    give_mission_card: { desc: "<b>Draw a random Mission Card</b> for yourself and another player. You win it, green side up.", vibe: ShopVibe.RED },

    free_master_card: { desc: "<b>Draw the top Master Card</b>. You win it, green side up.", vibe: ShopVibe.GREEN },
    decide_master_card: { desc: "Decide who <b>gets the Master Card</b> this round.", vibe: ShopVibe.RED },

    become_active: { desc: "You become the next <b>active player</b>.", vibe: ShopVibe.GREEN },
    decide_active: { desc: "You <b>decide</b> who becomes the next <b>active player</b> (excluding yourself).", vibe: ShopVibe.RED },

    remove_votes: { desc: "<b>Ignore (at most) 2 Votes</b> from this round.", vibe: ShopVibe.GREEN },
    remove_votes_worse: { desc: "<b>Ignore the Vote</b> of your <b>left neighbor</b> this round.", vibe: ShopVibe.RED },

    change_vote_numbers: { desc: "<b>Change</b> the <b>numbers on all Votes</b> to anything you want.", vibe: ShopVibe.GREEN },
    change_vote_numbers_worse: { desc: "<b>Change</b> the number on your <b>own Vote</b> to anything you want.", vibe: ShopVibe.RED },

    flip_mission_card: { desc: "<b>Flip</b> (at most) 2 Mission Cards of any player.", vibe: ShopVibe.GREEN },
    flip_mission_card_restricted: { desc: "<b>Flip</b> 1 Mission Card of yours.", vibe: ShopVibe.RED },

    add_proposal: { desc: "<b>Add</b> (at most) 2 cards to the <b>mission</b>, from deck or market.", vibe: ShopVibe.GREEN },
    add_proposal_restricted: { desc: "<b>Add</b> 1 card to the <b>mission</b> from the market.", vibe: ShopVibe.RED },

    remove_proposal: { desc: "<b>Remove</b> (at most) 3 cards from the <b>mission</b>.", vibe: ShopVibe.GREEN },
    remove_proposal_restricted: { desc: "<b>Remove</b> 1 card from the <b>mission</b>.", vibe: ShopVibe.RED },

    reveal_votes: { desc: "All other players must <b>reveal their Votes</b> to you.", vibe: ShopVibe.GREEN },
    reveal_votes_restricted: { desc: "Pick 1 player. They must <b>reveal their Votes</b> to you.", vibe: ShopVibe.RED },

    swap_votes: { desc: "<b>Swap</b> (at most) 3 of your Votes for new ones from the deck.", vibe: ShopVibe.GREEN },
    draw_votes: { desc: "All players <b>draw 2 more Votes</b> into their hand.", vibe: ShopVibe.RED },

    market_change: { desc: "Permanently <b>change market size</b> by (at most) 2 cards.", vibe: ShopVibe.GREEN },
    market_change_worse: { desc: "Permanently <b>increase market size</b> by 1 card.", vibe: ShopVibe.RED },

    swap_cards: { desc: "<b>Swap 2 Mission Cards</b> of yours with ones from another player", vibe: ShopVibe.GREEN },
    swap_cards_restricted: { desc: "<b>Swap a Mission Card</b> of yours with one from another player, with the same side up.", vibe: ShopVibe.RED },

    buy_next_green: { desc: "Draw a <b>new Shop Card</b> and get whatever is on its <b>green side</b>.", vibe: ShopVibe.GREEN },
    buy_next_red: { desc: "Draw a <b>new Shop Card</b> and get whatever is on its <b>red side</b>.", vibe: ShopVibe.RED },

    buy_vote: { desc: "When buying next round, <b>hold a Vote</b>. Only purchase at SUCCESS. (Redraw 1 Vote afterwards.)", vibe: ShopVibe.RED },
    buy_vote_all: { desc: "When buying next round, <b>hold a Vote</b>. If SUCCESS, everyone gets the reward.", vibe: ShopVibe.RED },
}

export const GADGET_NAMES = ["Sneaky Spectacles", "Snoopinator 3000", "Cufflink Comms", "Giggling Glasses", "Stealthy Stickers", "Bicycle Bugs", "Lipstick Listener", "Spy Pen", "Jocular Jetpack", "Bisexual Briefcase", "Weather Wig", "Disguise Drone", "Hidden Hat", "Gadget Gloves", "Code Crackilator", "Invisibility Cloak", "Signal Sender", "Eavesdropper X100", "Flying Umbrella", "GPS Giraffe", "Magnetic Monocle", "Laser Lipstick", "Lie Detector", "Walkie-Walkie", "Mini Microphone", "Crow Camera", "Holographic Hat", "Whisper Watch", "Spy Socks", "Super Scanner", "Fake Vault", "Luminous Locket", "Super Suit", "Bubble Blanket", "Gaming Goggles", "Camera Cane", "Wireless Shoes", "Jukebox Jammers", "Fingertip Recorder", "Charming Chameleon", "Hyper Holster", "Gravity Gun", "Nuke Necklace", "Pencil Phone", "Gun Guitar", "Racing Robot"]


export const CARD_TEMPLATES =
{
    mission: { frame: 0 },
    master: { frame: 1 },
    identity_private: { frame: 2 },
    identity_public: { frame: 3 },
    vote_yes: { frame: 4 },
    vote_no: { frame: 5 },
    shop: { frame: 6 }
}

// this is used when doing the dynamic replacements
export const DYNAMIC_OPTIONS =
{
    "%vote%": ["YES", "NO"],
    "%num%": [1,2,3],
    "%resource%": toTextDrawerImageStrings(RESOURCES, "misc"),
    "%comparison%": ["at least", "at most"],
    "%status%": ["SUCCES", "FAIL"],
}

