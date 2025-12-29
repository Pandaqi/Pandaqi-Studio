
export enum CardType
{
    VOTE = "vote",
    DECREE = "decree"
}

export enum DecreeType
{
    LAW = "law",
    SUPPORT = "support",
    RESOURCE = "resource"
}

export enum VoteType
{
    YES = "yes",
    NO = "no",
    ABSTAIN = "abstain"
}

export type CardSubType = VoteType | DecreeType

export interface SideDetails
{
    goodIcons?: string[],
    badIcons?: string[],
    goodText?: string,
    badText?: string
}

// @NOTE: these keys must match CardType_CardSubType export enums exactly
export interface IconData
{
    frame: number,
    set?: string
}

export const CARD_TEMPLATES:Record<string, IconData> =
{
    decree_law: { frame: 0 },
    decree_support: { frame: 1 },
    decree_resource: { frame: 2 },
    vote_yes: { frame: 3 },
    vote_no: { frame: 4 },
    vote_abstain: { frame: 5 }
}

export const MISC:Record<string, IconData> =
{
    vote_storage: { frame: 0 },
    support: { frame: 1 },
    vote_yes: { frame: 10 },
    vote_no: { frame: 11 },
    vote_abstain: { frame: 12 }
}

export const ICONS:Record<string, IconData> =
{
    money: { frame: 2, set: "base" },
    homes: { frame: 3, set: "base" },
    science: { frame: 4, set: "always" },
    wood: { frame: 5, set: "always" },
    livestock: { frame: 6, set: "advanced" },
    military: { frame: 7, set: "never" }, // just too hard to read this one; could switch to an icon of double-crossed swords
    minerals: { frame: 8, set: "always" },
    nature: { frame: 9, set: "always" },
    wildcard: { frame: 13, set: "never" }
}

export enum LawType
{
    SCORING = "scoring", // changes which things score and how much
    VOTING = "voting", // changes how much vote you get, how you can use them, and the gameplay element of voting
    CARDS = "cards", // changes how cards work, how much you get, how much you may play, etcetera
    RESOURCES = "resources", // changes how resources can be used (outside of scoring), such as a shop mechanic
    MISC = "misc", // anything else
}

export enum LawVibe
{
    GOOD = "good",
    BAD = "bad"
}

export interface LawDataRaw
{
    key: string,
    replacements: Record<string, any[]>
}

export interface LawData
{
    desc: string,
    type: LawType|LawType[],
    vibe?: LawVibe, // "good" default 
    set?: string, // "base" default
    prob?: number, // 1.0 default
}

export const LAWS:Record<string, LawData> = 
{
    // things that that change scoring
    resource_points_bonus: { desc: "%resource% is worth <b>+2 points</b>.", type: LawType.SCORING, vibe: LawVibe.GOOD, prob: 3.0 },
    resource_points_penalty: { desc: "%resource% is worth <b>-1 point</b>.", type: LawType.SCORING, vibe: LawVibe.BAD, prob: 2.0 },
    resource_total_bonus: { desc: "Score <b>+5 points</b> if you own %comparison% %numhigh% resources.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    resource_total_specific_bonus: { desc: "Score <b>+5 points</b> if you own %comparison% %nummid% %resource%.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    resource_diversity_bonus: { desc: "Score <b>+5 points</b> if you own all different resource types.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    resource_diversity_penalty: { desc: "Score <b>-3 points</b> if you own at most %numlow% different resource types.", type: LawType.SCORING, vibe: LawVibe.BAD },
    resource_pair_bonus: { desc: "Each pair of %resource% and %resource% is worth <b>+2 points</b>.", type: LawType.SCORING, vibe: LawVibe.GOOD, prob: 3.0 },
    resource_pair_penalty: { desc: "Each pair of %resource% and %resource% is worth <b>-1 point</b>.", type: LawType.SCORING, vibe: LawVibe.BAD, prob: 2.0 },
    resource_trio_reward: { desc: "Each trio of %resource%, %resource% and %resource% is worth <b>%sign% point</b>.", type: LawType.SCORING, vibe: LawVibe.BAD, prob: 1.5 },
    resource_exclusion: { desc: "For each %resource% you own, 1 %resource% of yours is worth <b>0 points</b>.", type: LawType.SCORING, vibe: LawVibe.BAD, prob: 2.0 },
    support_scoring: { desc: "Each <b>Support</b> card is worth <b>+1 point</b>.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    support_total_scoring: { desc: "Each <b>Support</b> card is worth as many points as its number of icons.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    vote_storage_scoring: { desc: "Each card that allows storing %comparison% %numlow% votes, scores <b>+1 point</b>.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    vote_stored_scoring: { desc: "Each card with %comparison% %numlow% votes stored on it, scores <b>+1 point</b>.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    vote_stored_none_scoring: { desc: "Each card that stores <b>no</b> votes on it, scores <b>%sign% point</b>.", type: LawType.SCORING, vibe: LawVibe.BAD },
    num_cards_scoring: { desc: "Score <b>+5 points</b> if you have %comparison% %nummid% cards won.", type: LawType.SCORING, vibe: LawVibe.GOOD },
    active_player_scoring_bonus: { desc: "The active player gets <b>+3 points</b> for free (that round).", type: LawType.SCORING, vibe: LawVibe.GOOD },
    active_player_scoring_penalty: { desc: "The active player gets <b>-2 points</b> for free (that round).", type: LawType.SCORING, vibe: LawVibe.BAD },

    // things that change how voting works or how it's handled
    majority_modify: { desc: "You need <b>%sign% YES vote</b> than usual for SUCCESS.", type: LawType.VOTING },
    vote_cutoff: { desc: "All <b>%vote% votes</b> below %numhigh% <b>don't count</b>.", type: LawType.VOTING },
    order_invert: { desc: "The <b>order</b> of handling votes is inverted (high to low).", type: LawType.VOTING },
    flip_card_highest: { desc: "If you voted the %extreme% number, <b>flip</b> one card.", type: LawType.VOTING },
    vote_neighbors: { desc: "If you voted the <b>same as your neighbors</b>, collect +1 Vote this round.", type: LawType.VOTING },
    status_vote_penalty: { desc: "If the proposal <b>%status%</b>, all <b>%vote%</b> voters lose 1 stored Vote.", type: LawType.VOTING },
    status_vote_bonus: { desc: "If the proposal <b>%status%</b>, all <b>%vote%</b> voters collect +1 Vote.", type: LawType.VOTING },
    public_vote: { desc: "<b>Voting happens publicly.</b> From active player, in clockwise turns, play your vote facup.", type: LawType.VOTING },
    public_storage: { desc: "Votes must be <b>stored faceup</b>. To keep voting secret, take them all into your hand when picking.", type: LawType.VOTING }, // too complicated?
    multi_vote: { desc: "You may play <b>2 votes</b> per round.", type: LawType.VOTING },
    active_player_bonus: { desc: "The vote of the active player <b>counts double</b>.", type: LawType.VOTING },
    active_player_shutout: { desc: "The active player <b>may not vote</b> on their own proposal.", type: LawType.VOTING },
    win_cards: { desc: "If the proposal is <b>emptied</b> before a player wins any card, they score any <b>hand card</b>.", type: LawType.VOTING },
    no_voters_penalty: { desc: "Only the <b>%extreme% NO voter</b> wins a card. The other NO-voters get nothing.", type: LawType.VOTING },
    no_voters_reward: { desc: "The <b>%extreme% %vote% voter</b> may <b>choose</b> whether they want to win any cards this round.", type: LawType.VOTING },
    yes_voters_bonus: { desc: "The <b>%extreme% YES voter</b> may win 2 cards from the proposal at once.", type: LawType.VOTING },
    active_player_vote_open: { desc: "The active player must <b>vote first</b> and play their card <b>faceup</b>.", type: LawType.VOTING },

    // things that change how cards work or how they can be used
    proposal_size_max: { desc: "Add %sign% to the maximum <b>number of cards</b> in a proposal.", type: LawType.CARDS },
    proposal_size_min: { desc: "Add +1 to the minimum <b>number of cards</b> in a proposal.", type: LawType.CARDS },
    vote_storage_change: { desc: "Add %sign% to the maximum vote storage of all cards. (Ignore issues on existing cards.)", type: LawType.CARDS },
    type_requirement: { desc: "Each proposal must include %comparison% %numlow% %decree% card (if possible).", type: LawType.CARDS },
    hand_size_change: { desc: "Add %sign% to the number of cards you have in your hand.", type: LawType.CARDS },
    refill_change: { desc: "Refill your hand immediately after making your proposal.", type: LawType.CARDS },
    resource_card_value: { desc: "<b>Discarding Resource cards</b> gives you as many Votes as its <b>number of icons</b>.", type: LawType.CARDS },
    flip_all_cards: { desc: "The player who voted %extreme% must flip all their cards.", type: LawType.CARDS },
    open_hands: { desc: "Play with <b>open hands</b>: everyone can see each other's hand cards.", type: LawType.CARDS },
    active_player_reveal: { desc: "The active player must <b>reveal their cards</b> at the end of their turn.", type: LawType.CARDS },

    // any misc(ellaneous) leftovers
    active_player_change_vote: { desc: "The <b>%extreme% voter</b> becomes the next active player.", type: LawType.MISC },
    active_player_change_stored: { desc: "The player with the <b>least stored votes</b> becomes the next active player (unless there's a tie).", type: LawType.MISC },
    active_player_order: { desc: "Turns now go <b>counter clockwise</b>.", type: LawType.MISC },
    active_player_double: { desc: "The active player takes <b>another turn</b> if their proposal <b>%status%</b>.", type: LawType.MISC },
    law_removal: { desc: "If the proposal <b>%status%</b>, the active player may <b>discard 1 Law</b> (already enacted).", type: LawType.MISC },
    trading: { desc: "At the start of your turn, you may <b>negotiate trades</b> using cards or votes you've won.", type: LawType.MISC },
    score_target_plus: { desc: "Add <b>+5</b> to the score at which you <b>win the game</b>.", type: LawType.MISC },
    score_target_min: { desc: "Add <b>-5</b> to the score at which you <b>win the game</b>.", type: LawType.MISC },

    // things related to ABSTAIN votes (optional expansion)
    abstain_vote_anyway: { desc: "<b>ABSTAIN votes count</b>. After voting, in numeric order, you decide if your vote meant YES or NO", type: LawType.VOTING, set: "abstain" },
    abstain_change: { desc: "In numeric order, ABSTAIN voters must <b>add or remove</b> 1 card from the proposal.", type: LawType.VOTING, set: "abstain" },
    abstain_all_lose_card: { desc: "If <b>all</b> players ABSTAIN, everyone loses one card they've won.", type: LawType.VOTING, set: "abstain" },
    abstain_all_win_all: { desc: "If <b>all</b> players ABSTAIN, the active player wins all cards in the proposal.", type: LawType.VOTING, set: "abstain" },
    abstain_all_win: { desc: "If <b>all</b> players ABSTAIN, the proposal SUCCEEDS.", type: LawType.VOTING, set: "abstain" },
    abstain_reverse_order: { desc: "If anyone <b>votes ABSTAIN</b>, numeric order <b>inverts</b> (handle votes high to low).", type: LawType.VOTING, set: "abstain" },
    abstain_determine_status: { desc: "If an odd number of players <b>votes ABSTAIN</b>, the proposal <b>%status%</b>.", type: LawType.VOTING, set: "abstain" },
    abstain_collect_change: { desc: "ABSTAIN voters collect <b>%sign% vote</b> at the end of the round.", type: LawType.VOTING, set: "abstain" },
    abstain_forbidden: { desc: "It's forbidden to <b>vote ABSTAIN</b> (unless you must).", type: LawType.VOTING, set: "abstain" },
    abstain_scoring: { desc: "Each ABSTAIN vote you stored is worth <b>+1 point</b>.", type: [LawType.SCORING, LawType.VOTING], set: "abstain" },
    win_cards_cutoff: { desc: "When picking cards, <b>don't cycle</b> until done. Leftover cards are simply discarded.", type: LawType.VOTING, set: "abstain" }, // added to ABSTAIN because this is more likely to be valuable when some voters don't count.


    // things that allow using your RESOURCES for something BESIDES SCORING
    // @NOTE: for now, I moved these to the Advanced expansion, because the base game already has enough Laws.
    // but this might prove so crucial/fun to the game that it moves back to base.
    resource_shop_vote: { desc: "Pay %numlow% %resource% to collect %numlow% votes.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_law: { desc: "Pay %numlow% %resource% to immediately enact a Law from your hand.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_law_remove: { desc: "Pay %numlow% %resource% to remove an enacted Law.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_hand_card: { desc: "Pay %numlow% %resource% to immediately win a card from your hand (green side up).", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_hand_size: { desc: "Pay %numlow% %resource% to draw 4 more cards into your hand.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_discard: { desc: "Pay %numlow% %resource% to get rid of (at most) %numlow% cards you've won.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_active_player: { desc: "The active player can pay %numlow% %resource% to stay active player next round.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_forbid_vote: { desc: "The active player can pay %numlow% %resource% to forbid (at most) 2 other players to Vote.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_change_vote_number: { desc: "The active player can pay %numlow% %resource% to change the number on all Votes this round.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_change_vote_type: { desc: "The active player can pay %numlow% %resource% to switch 2 Votes YES <> NO.", type: LawType.RESOURCES, set: "advanced" },
    resource_shop_support_flip: { desc: "Pay %numlow% Support to flip all cards with red side up.", type: LawType.RESOURCES, set: "advanced" },

    // things that target the Undecided Voters (with Move Votes phase) expansion
    many_votes_penalty: { desc: "Score <b>-5 points</b> if you've stored more than %numhigh% votes.", type: LawType.SCORING, set: "undecided" },
    many_cards_penalty: { desc: "Score <b>-5 points</b> if you've won %nummid% cards (or more).", type: LawType.SCORING, set: "undecided" },
    move_votes_no_laws: { desc: "During Move Votes: you can't Move <b>%vote%</b> votes onto a Law anymore.", type: LawType.CARDS, set: "undecided" },
    move_votes_instant_discard: { desc: "During Move Votes: whenever a law is disabled this way, instantly <b>discard<.b> it.", type: LawType.CARDS, set: "undecided" },
    move_votes_cost_change: { desc: "During Move Votes: it costs <b>%sign%</b> Votes to discard/flip an existing card.", type: LawType.CARDS, set: "undecided" },
    move_votes_no_discard: { desc: "During Move Votes: you <b>can't discard</b> a card anymore, only flip it.", type: LawType.CARDS, set: "undecided" },
    move_votes_no_flip: { desc: "During Move Votes: you <b>can't flip</b> a card anymore, only discard it.", type: LawType.CARDS, set: "undecided" }
};


export enum ResourceVibe
{
    GOOD = "good",
    BAD = "bad"
}

interface ResourceData
{
    desc: string,
    vibe: ResourceVibe
}

// These are unique, special _texts_ that display on resource cards instead of default icons
// They are only in the "Advanced Politics" expansion and provide interesting variety to what a card can do/represent.
export const SPECIAL_RESOURCES:Record<string, ResourceData> =
{
    // generally good things
    duplicate_least_resource: { desc: "Worth <b>2 resources</b> of the type you have the <b>least</b>.", vibe: ResourceVibe.GOOD },
    duplicate_most_resource: { desc: "Worth <b>2 resources</b> of the type you have the <b>most</b>.", vibe: ResourceVibe.GOOD },
    duplicate_active_resource: { desc: "Worth <b>1 resource</b> of any type the <b>active player</b> has.", vibe: ResourceVibe.GOOD },
    resource_choice: { desc: "Worth 2 %resource% OR 2 %resource%.", vibe: ResourceVibe.GOOD },
    resource_vote_storage: { desc: "Worth as many %resource% as the number of votes stored on here.", vibe: ResourceVibe.GOOD },
    resource_conditional_vote: { desc: "Worth <b>3 %resource%</b> if you <b>voted %vote%</b> this round.", vibe: ResourceVibe.GOOD },
    resource_conditional_status: { desc: "Worth <b>3 %resource%</b> if the proposal <b>%status%</b> this round.", vibe: ResourceVibe.GOOD },
    resource_biggest_scoring: { desc: "Worth <b>1 resource</b> of the type that currently <b>scores the most</b>.", vibe: ResourceVibe.GOOD },
    resource_smallest_scoring: { desc: "Worth <b>3 resources</b> of the type that currently <b>scores the least</b>.", vibe: ResourceVibe.GOOD },
    add_support: { desc: "<b>Adds</b> as much Support as the <b>number of votes</b> on this.", vibe: ResourceVibe.GOOD },
    add_wildcard_conditional: { desc: "Worth <b>4 resources</b> of any kind, unless you own all possible resources.", vibe: ResourceVibe.GOOD },

    // actions are always GOOD, otherwise you'll never take them
    prevent_vote: { desc: "<b>Discard</b> this card (before voting) to prevent having to Vote this round.", vibe: ResourceVibe.GOOD },
    prevent_card_draw: { desc: "<b>Discard</b> this card to prevent having to <b>grab cards from the proposal</b> that round.", vibe: ResourceVibe.GOOD },
    flip_card: { desc: "<b>Discard</b> this card to <b>flip</b> 1 collected card.", vibe: ResourceVibe.GOOD },
    remove_card: { desc: "<b>Discard</b> this card to <b>remove</b> 1 collected card.", vibe: ResourceVibe.GOOD },
    swap_votes: { desc: "<b>Discard</b> this card to swap at most 4 Votes with another player.", vibe: ResourceVibe.GOOD },
    become_active_player: { desc: "<b>Discard</b> this card to instantly become active player.", vibe: ResourceVibe.GOOD },
    add_card: { desc: "<b>Discard</b> this card (before voting) to instantly <b>win</b> 1 card from the proposal.", vibe: ResourceVibe.GOOD },
    change_vote_type: { desc: "<b>Discard</b> this card (after voting) to change the type of one vote (YES <> NO).", vibe: ResourceVibe.GOOD },
    change_vote_number: { desc: "<b>Discard</b> this card (after voting) to change the <b>number</b> of one vote.", vibe: ResourceVibe.GOOD },

    // generally bad things
    nullify_least_resource: { desc: "All instances of the resource you have the <b>least</b> are worth <b>0 points</b>.", vibe: ResourceVibe.BAD },
    nullify_most_resource: { desc: "All instances of the resource you have the <b>most</b> are worth <b>0 points</b>.", vibe: ResourceVibe.BAD },
    nullify_active_resource: { desc: "Each resource type the <b>active player</b> has is worth <b>0 points</b> to you.", vibe: ResourceVibe.BAD },
    resource_choice_removal: { desc: "Removes %resource% OR %resource%.", vibe: ResourceVibe.BAD },
    resource_vote_storage_penalty: { desc: "Removes 1 %resource% for every vote stored on here.", vibe: ResourceVibe.BAD },
    resource_conditional_vote_penalty: { desc: "Removes <b>2 %resource%</b> if you <b>voted %vote%</b> this round.", vibe: ResourceVibe.BAD },
    resource_conditional_status_penalty: { desc: "Removes <b>2 %resource%</b> if the proposal <b>%status%</b> this round.", vibe: ResourceVibe.BAD },
    blind_proposal: { desc: "On your turn, you must shuffle your cards and create your proposal <b>blind</b>.", vibe: ResourceVibe.BAD },
    blind_vote: { desc: "On your turn, you must shuffle your votes and vote <b>blind</b>.", vibe: ResourceVibe.BAD },
    remove_one_icon_each: { desc: "Removes 1 icon from each card of yours. (Pretend it doesn't exist.)", vibe: ResourceVibe.BAD },
    remove_support: { desc: "<b>Removes</b> as much Support as the <b>number of votes</b> on this.", vibe: ResourceVibe.BAD },
    remove_wildcard_conditional: { desc: "<b>Removes 4 resources</b> of any kind, unless you own all possible resources.", vibe: ResourceVibe.BAD },
}

export const DYNAMIC_OPTIONS = 
{
    "%resource%": [], // these two are filled in when generation starts, based on config settings
    "%resourceImageStrings%": [],
    "%comparison%": ["at least", "at most"],
    "%numlow%": [1,2,3],
    "%nummid%": [4,5,6],
    "%numhigh%": [7,8,9,10],
    "%sign%": ["+1", "-1"],
    "%status%": ["SUCCEEDS", "FAILS"],
    "%vote%": ["YES", "NO"], // abstain is an expansion and thus handled on its own
    "%decree%": ["Law", "Support", "Resource"],
    "%extreme%": ["lowest", "highest"]
}

