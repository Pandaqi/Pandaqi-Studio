
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
    forced_vote_resource: { desc: "You must vote %vote% if the mission contains %num% %resource% (or more).", type: IdentityType.BAD },
    forced_vote_num: { desc: "You must vote %vote% if the mission has %comparison% %num% cards", type: IdentityType.BAD },
    double_vote_resource: { desc: "If the mission contains %num% %resource% (or more), your vote counts double.", type: IdentityType.GOOD },
    double_vote_num: { desc: "If the mission contains %comparison% %num% cards, your vote counts double.", type: IdentityType.GOOD },
    neighbor_vote_type: { desc: "If you voted the same as both your neighbors, your vote doesn't count.", type: IdentityType.BAD },
    neighbor_vote_num: { desc: "If your number is lower than both your neighbors, your vote doesn't count.", type: IdentityType.BAD },
    forbidden_resource: { desc: "If the mission contains %num% %resource% (or more), your vote doesn't count.", type: IdentityType.BAD },
    forbidden_num: { desc: "When proposing a mission, it must always have %comparison% %num% cards.", type: IdentityType.BAD },

    change_vote_num_raise: { desc: "If you vote %vote%, your number is always raised by 15, unless that leads to duplicates.", type: IdentityType.BAD },
    change_vote_num_lower: { desc: "If you vote %vote%, your number is always lowered by 15, unless that leads to duplicates.", type: IdentityType.GOOD },

    // @TODO: hard to guarantee order if multiple players have this, think about this
    change_order: { desc: "If the mission %status% and you voted %vote%, you may collect a card before anyone else.", type: IdentityType.GOOD }, 
    master_card: { desc: "If the mission %status% and the active player voted %vote%, you win the Master Card instead.", type: IdentityType.GOOD },

}

const SECRET_IDENTITIES:Record<string, IdentityCardData> =
{
    resource_improve: { desc: "All %resource% are worth 2 points.", type: IdentityType.GOOD },
    resource_degrade: { desc: "All %resource% are worth -1 points.", type: IdentityType.BAD },
    total_resource_penalty: { desc: "If you have 4 %resource% (or more), you get -5 points.", type: IdentityType.BAD },
    total_resource_bonus: { desc: "If you have 8 %resource% (or more), you get +10 points.", type: IdentityType.GOOD },
    pair_bonus: { desc: "Every pair of %resource% and %resource% is worth 1 extra point.", type: IdentityType.GOOD },
    pair_penalty: { desc: "Every pair of %resource% and %resource% is worth 1 fewer point.", type: IdentityType.BAD },
    odd_resource_penalty: { desc: "If you have an odd number of %resource%, you get -4 points.", type: IdentityType.BAD },
    even_resource_bonus: { desc: "If you have an even number of %resource%, you get +4 points.", type: IdentityType.GOOD },
    limited_card_benefit: { desc: "For each Mission Card, you must pick one icon that's completely ignored when scoring.", type: IdentityType.BAD },
    increased_card_benefit: { desc: "Every collected Mission Card showing %comparison% %num% icons has its value doubled.", type: IdentityType.GOOD }
}


interface MasterCardData
{
    desc: string,
}

const MASTER_CARDS:Record<string,MasterCardData> =
{
    number_cutoff_high: { desc: "Votes above 15 don't count." },
    number_cutoff_low: { desc: "Votes below 15 don't count." },
    cards_num_high: { desc: "This mission needs at least 3 cards." },
    cards_num_low: { desc: "This mission can have at most 2 cards." },
    votes_num: { desc: "Players <b>may</b> cast 2 votes." },
    no_voters_include: { desc: "All <b>NO</b> voters must collect a card too, with red side up." },
    identical_voters: { desc: "If everyone votes the same, end the round immediately." },

    yes_vote_required: { desc: "If possible, you <b>must</b> vote YES." },
    no_vote_required: { desc: "If possible, you <b>must</b> vote NO." },
    yes_vote_double: { desc: "All YES-votes count double." },
    no_vote_double: { desc: "All NO-votes count double." },
    double_vote_active: { desc: "The vote of the active player counts double." },
    study_master_cards: { desc: "Reveal the top 5 Master Cards in the deck." },

    swap_votes: { desc: "Round Start: everyone must discard 3 Votes and draw 3 new ones." },
    flip_card: { desc: "Round Start: everyone must rotate 1 of their cards (green side up <-> red side up)." },
    reveal_hand_yes: { desc: "Round End: all YES-voters must reveal the Votes left in their hand." },
    reveal_hand_no: { desc: "Round End: all NO-voters must reveal the Votes left in their hand." },

    majority_raise: { desc: "This mission needs 1 extra YES vote than usual to reach majority." },
    majority_lower: { desc: "This mission needs 1 fewer YES vote than usual to reach majority." },
    invert_order: { desc: "The order for collecting cards after voting is inverted." },
    open_voting: { desc: "A public vote! From active player, vote in clockwise turns, faceup." },

    resource_diversity_max: { desc: "The mission may include at most 2 different resources (if possible)." },
    resource_diversity_min: { desc: "The mission must include at least 3 different resources (if possible)." },
    give_info: { desc: "Round Start: All players must say the lowest or highest Vote in their hand." },

    // these rules (with "player with the highest number") aim to make it specific to _one player_, not all,
    // which allows the card to be meaningfully "played" too
    // @TODO: invent a few more of these with variations of lowest number and such
    late_change: { desc: "After Voting: the player with the highest number may still add or remove a mission card." },
    swap_card: { desc: "After Voting: the player with the highest number swaps 1 collected card with one from another player." }
}

const RESOURCES =
{
    gold: { frame: 0 },
    reputation: { frame: 1 },
    weapons: { frame: 2 },
    intelligence: { frame: 3 }
}

// this is eventually used when doing the dynamic replacements
const DYNAMIC_OPTIONS =
{
    "%vote%": ["YES", "NO"],
    "%num%": [1,2,3],
    "%resource%": Object.keys(RESOURCES),
    "%comparison%": ["at least", "at most"],
    "%status%": ["SUCCEEDED", "FAILED"],
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
    RESOURCES
};

