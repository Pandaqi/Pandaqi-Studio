
interface CardResource
{
    type: string,
    cross?: boolean
}

interface CardResourceData
{
    good: CardResource[],
    bad: CardResource[]
}

interface CardPowerData
{
    good: string,
    bad: string
}

enum CardType
{
    MISSION,
    IDENTITY,
    VOTE
}

type CardSubType = VoteType | IdentityCardType | MissionType

enum MissionType
{
    MISSION = "mission",
    MASTER = "master"
}

enum VoteType
{
    YES = "yes",
    NO = "no"
}

enum IdentityCardType
{
    PUBLIC = "public",
    PRIVATE = "private" 
}

enum IdentityType
{
    GOOD = "good",
    BAD = "bad"
}

interface IdentityCardData
{
    desc: string,
    type: IdentityType
}

// each identity card combines a GOOD and a BAD power for balance
// (remember all these options are dynamically filled in, so there are actually hundreds of unique ones below)
const PUBLIC_IDENTITIES:Record<string,IdentityCardData> =
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

const SECRET_IDENTITIES:Record<string, IdentityCardData> =
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


interface MasterCardData
{
    desc: string,
}

const MASTER_CARDS:Record<string,MasterCardData> =
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
    flip_card: { desc: "<b>Round Start</b>: everyone rotates 1 of their cards (green side up <-> red side up)." },
    reveal_hand_yes: { desc: "<b>Round End</b>: all YES-voters <em>reveal their hand Votes</em>." },
    reveal_hand_no: { desc: "<b>Round End</b>: all NO-voters <em>reveal their hand Votes</em>." },

    majority_raise: { desc: "This mission needs <b>1 more YES</b> than usual to reach majority." },
    majority_lower: { desc: "This mission needs <b>1 fewer YES</b> than usual to reach majority." },
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

const RESOURCES =
{
    gold: { frame: 0 },
    reputation: { frame: 1 },
    weapons: { frame: 2 },
    intelligence: { frame: 3 }
}

const MISC =
{
    cross: { frame: 4 }
}

const RANDOM_TEXTS = [
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

const CARD_TEMPLATES =
{
    mission: { frame: 0 },
    master: { frame: 1 },
    identity_private: { frame: 2 },
    identity_public: { frame: 3 },
    vote_yes: { frame: 4 },
    vote_no: { frame: 5 }
}

// this is used when doing the dynamic replacements
// (the resources are ICONS, hence the quick conversion here)
const DYNAMIC_RESOURCE_LIST = [];
for(const [key,data] of Object.entries(RESOURCES))
{
    const str = '<img id="misc" frame="' + data.frame + '">';
    DYNAMIC_RESOURCE_LIST.push(str);
}


const DYNAMIC_OPTIONS =
{
    "%vote%": ["YES", "NO"],
    "%num%": [1,2,3],
    "%resource%": DYNAMIC_RESOURCE_LIST.slice(),
    "%comparison%": ["at least", "at most"],
    "%status%": ["SUCCES", "FAIL"],
}

export 
{
    CardResource,
    CardResourceData,
    CardPowerData,
    CardType,
    CardSubType,
    MissionType,
    VoteType,
    MasterCardData,
    MASTER_CARDS,
    IdentityType,
    IdentityCardType,
    IdentityCardData,
    PUBLIC_IDENTITIES,
    SECRET_IDENTITIES,
    DYNAMIC_OPTIONS,
    RESOURCES,
    RANDOM_TEXTS,
    MISC,
    CARD_TEMPLATES
};

